import { Injectable, Logger } from '@nestjs/common';
import { Event } from 'src/calendar/entities/event.entity';
import { ResourceCalendar } from 'src/calendar/entities/resource.calendar.entity';
import * as moment from 'moment';
import { Participant } from 'src/calendar/entities/participant.entity';
import { Attend } from 'src/calendar/entities/attend.entity';
import { EventDTO } from 'src/api/dto/event.dto';
import { ParticipantService } from '../database/participant.service';
import { AttendService } from '../database/attend.service';
import { ResourceCalendarService } from '../database/resource.calendar.service';
import { EventService } from '../database/event.service';
import { GoogleService } from '../google/google.service';
import { validate, ValidationError } from 'class-validator';
import e = require('express');

@Injectable()
export class EventHandlerService {
    private readonly logger = new Logger(EventHandlerService.name);

    /**
     * @param {GoogleService} googleService
     * @param {EventService} eventService
     * @param {ParticipantService} participantService
     * @param {AttendService} attendService
     * @param {ResourceCalendarService} resourceCalendarService
     */
    constructor(
        private readonly googleService: GoogleService,
        private readonly eventService: EventService,
        private readonly participantService: ParticipantService,
        private readonly attendService: AttendService,
        private readonly resourceCalendarService: ResourceCalendarService,
    ) {}

    /**
     * @param {Event} eventDTO
     * @param {ResourceCalendar} resourceCalendar
     * @return {any}
     */
    async insertEvent(
        eventDTO: EventDTO,
        resourceCalendar: ResourceCalendar,
    ): Promise<{ event: Event; errors: Array<any> | boolean }> {
        this.googleService.initialize(resourceCalendar.oauth);
        const response = await this.googleService.insertEvent(
            eventDTO,
            resourceCalendar,
        );
        const { data, errors } = response;
        if (errors) {
            this.logger.debug('Errors', errors.length);

            return { event: null, errors };
        }
        const event = new Event();
        event.resourceCalendar = resourceCalendar;
        await this.fillEvent(event, data);
        await this.saveEvent(event);
        await this.saveAttandees(
            await this.convertDataToAttendees(event, data),
            event,
        );

        return { event, errors: await this.saveEvent(event) };
    }

    /**
     * Download and save google events per resource calendar
     * @param {ResourceCalendar} resourceCalendar
     */
    async handleEventsPerResourceCalendar(resourceCalendar: ResourceCalendar) {
        let nextPageToken = null;
        this.googleService.initialize(resourceCalendar.oauth);
        do {
            const response = await this.googleService.getEvents(
                resourceCalendar.resourceEmail,
                nextPageToken,
            );
            const events = response.data;
            nextPageToken = events.nextPageToken;
            if (events.nextSyncToken) {
                resourceCalendar.nextSyncToken = events.nextSyncToken;
                await this.resourceCalendarService.save(resourceCalendar);
            }
            for (const data of events.items) {
                let event = await this.eventService.findOneByExternalIdAndResourceCalendarId(
                    resourceCalendar,
                    data.id,
                    this.getStartDate(data),
                    this.getEndDate(data),
                );
                event = event || new Event();
                event.resourceCalendar = resourceCalendar;
                await this.fillEvent(event, data);
                await this.saveEvent(event);
                await this.saveAttandees(
                    await this.convertDataToAttendees(event, data),
                    event,
                );
            }
        } while (nextPageToken);
    }

    /**
     * Sync events for resource calendar
     * @param {ResourceCalendar} resourceCalendar
     */
    async syncEventsPerResourceCalendar(resourceCalendar: ResourceCalendar) {
        let nextPageToken = null;
        this.googleService.initialize(resourceCalendar.oauth);
        do {
            const response = await this.googleService.syncEvents(
                resourceCalendar.resourceEmail,
                nextPageToken,
                resourceCalendar.nextSyncToken,
            );
            const events = response.data;
            nextPageToken = events.nextPageToken;
            if (events.nextSyncToken) {
                resourceCalendar.nextSyncToken = events.nextSyncToken;
                this.resourceCalendarService.save(resourceCalendar);
            }
            for (const data of events.items) {
                let event = await this.eventService.findOneByExternalIdAndResourceCalendarId(
                    resourceCalendar,
                    data.id,
                    this.getStartDate(data),
                    this.getEndDate(data),
                );
                event = event || new Event();
                !event.id
                    ? this.logger.debug(data, 'New event data!')
                    : this.logger.debug(event, 'Exist event!');

                if (data.status === 'cancelled') {
                    if (event.id) {
                        this.logger.debug('Cancelled event!');
                        event.status = data.status;
                        await this.saveEvent(event);

                        continue;
                    }

                    this.logger.debug(
                        "We don't have such event in DB, nothing sync.",
                    );
                    continue;
                }
                event.resourceCalendar = resourceCalendar;
                await this.fillEvent(event, data);
                await this.saveEvent(event);
                await this.saveAttandees(
                    await this.convertDataToAttendees(event, data),
                    event,
                );
            }
        } while (nextPageToken);
    }

    /**
     * Fill Event entity from google data object
     * @param {Event} event
     * @param {object} data
     * @return {Event}
     */
    protected async fillEvent(event: Event, data): Promise<Event> {
        this.logger.debug(data.summary, 'Event.');
        event.externalId = data.id;
        event.summary = data.summary;
        event.description = data.description;
        event.status = data.status;
        event.etag = data.etag;
        event.iCalUID = data.iCalUID;
        event.creator = data.creator.email;
        event.start = this.getStartDate(data);
        event.end = this.getEndDate(data);
        if (data.organizer && data.organizer.email) {
            event.organizer = data.organizer.email;
        } else {
            event.organizer = null;
        }
        event.sequence = data.sequence ?? null;
        event.location = data.location ?? null;

        return event;
    }

    /**
     * Grab attendees from data then attach it to event
     * @param {Event} event
     * @param {object} data
     * @return <Attend[]>
     */
    protected async convertDataToAttendees(
        event: Event,
        data,
    ): Promise<Attend[]> {
        if (!data.attendees) {
            this.logger.debug(data.attendees, 'There are no attendees.');
            return [];
        }
        const attendees = [];
        for (const attend of data.attendees) {
            const participant = await this.participantService.getOrCreateParticipant(
                attend.email,
            );
            const newAttend = new Attend();
            newAttend.event = event;
            newAttend.participant = participant;
            newAttend.responseStatus = attend.responseStatus;
            newAttend.isResource = attend.resource ?? false;
            attendees.push(newAttend);
        }

        return attendees;
    }

    /**
     * @param {object} data
     * @return {Date}|null
     */
    protected getStartDate(data): Date | null {
        if (data.start && data.start.dateTime) {
            const date = moment(data.start.dateTime).toDate();
            return date;
        }

        return null;
    }

    /**
     * @param {object} data
     * @return {Date}|null
     */
    protected getEndDate(data): Date | null {
        if (data.end && data.end.dateTime) {
            const date = moment(data.end.dateTime).toDate();
            return date;
        }

        return null;
    }

    /**
     *
     * @param {Event} event
     */
    protected async saveEvent(
        event: Event,
    ): Promise<boolean | ValidationError[]> {
        const validationErrors = await validate(event);
        if (validationErrors.length > 0) {
            this.logger.error(validationErrors, 'Validation error.');

            return validationErrors;
        }

        await this.eventService.save(event);

        return true;
    }

    /**
     * @param {Attend} attendees[]
     * @param {Event} event
     */
    protected async saveAttandees(
        attendees: Attend[],
        event: Event,
    ): Promise<void> {
        await this.attendService.deleteAttendees(event);
        for (const attend of attendees) {
            const errors = await validate(attend);
            if (errors.length > 0) {
                this.logger.debug(errors, 'Validation errors!');
                continue;
            }

            await this.attendService.save(attend);
        }
    }
}
