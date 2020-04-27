import {Injectable, Logger} from '@nestjs/common';
import {GoogleService} from '../google/google.service';
import {Event} from 'src/calendar/entities/event.entity';
import {EventService} from '../database/event.service';
import {ResourceCalendar} from 'src/calendar/entities/resource.calendar.entity';
import * as moment from 'moment';
import {Participant} from 'src/calendar/entities/participant.entity';
import {Attend} from 'src/calendar/entities/attend.entity';
import {ParticipantService} from '../database/participant.service';
import {AttendService} from '../database/attend.service';
import {ResourceCalendarService} from '../database/resource.calendar.service';

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
    ) {
    }

    /**
     * @param {Event} eventDTO
     * @param {ResourceCalendar} resourceCalendar
     * @return {Event}
     */
    async insertEvent(eventDTO: Event, resourceCalendar: ResourceCalendar): Promise<Event> {
        this.googleService.initialize(resourceCalendar.oauth);
        const response = await this.googleService.insertEvent(eventDTO, resourceCalendar);
        const data = response.data;
        const event = new Event();
        event.resourceCalendar = resourceCalendar;
        this.fillEvent(event, data);

        return event;
    }

    /**
     * Download and save google events per resource calendar
     * @param {ResourceCalendar} resourceCalendar
     */
    async handleEventsPerResourceCalendar(resourceCalendar: ResourceCalendar) {
        let nextPageToken = null;
        this.googleService.initialize(resourceCalendar.oauth);
        do {
            const response = await this.googleService.getEvents(resourceCalendar.resourceEmail, nextPageToken);
            const events = response.data;
            nextPageToken = events.nextPageToken;
            if (events.nextSyncToken) {
                resourceCalendar.nextSyncToken = events.nextSyncToken;
                await this.resourceCalendarService.save(resourceCalendar);
            }
            for (const data of events.items) {
                let event = await this.eventService.findOneByExternalIdAndResourceCalendarId(resourceCalendar, data.id);
                event = event ? event : new Event();
                event.resourceCalendar = resourceCalendar;
                this.fillEvent(event, data);
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
            const response = await this.googleService.syncEvents(resourceCalendar.resourceEmail, nextPageToken, resourceCalendar.nextSyncToken);
            const events = response.data;
            nextPageToken = events.nextPageToken;
            if (events.nextSyncToken) {
                resourceCalendar.nextSyncToken = events.nextSyncToken;
                await this.resourceCalendarService.save(resourceCalendar);
            }
            for (const data of events.items) {
                let event = await this.eventService.findOneByExternalIdAndResourceCalendarId(resourceCalendar, data.id);
                event = event ? event : new Event();
                (!event.id) ? this.logger.debug('New event!') : this.logger.debug('Exist event!', event.id.toString());

                if (data.status === 'cancelled') {
                    if (event.id) {
                        this.logger.debug('Cancelled event!');
                        event.status = data.status;
                        await this.eventService.save(event);
                    }
                    break;
                }
                event.resourceCalendar = resourceCalendar;
                this.fillEvent(event, data);
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
        this.logger.debug(data, 'New event data from google.');
        this.logger.debug(event, 'Event object.');
        event.externalId = data.id;
        event.name = data.summary;
        event.description = data.description;
        event.status = data.status;
        event.etag = data.etag;
        event.iCalUID = data.iCalUID;
        event.creator = data.creator.email;
        await this.addStartAndEndDates(event, data);

        if ((event.end && event.start) || event.id) {
            await this.eventService.save(event);
            await this.addAttendees(event, data);
        }

        return event;
    }

    /**
     * Grab attendees from data then attach it to event
     * @param {Event} event
     * @param {object} data
     */
    protected async addAttendees(event: Event, data) {
        await this.attendService.deleteAttendees(event);
        if (!data.attendees) {
            this.logger.debug(data.attendees, 'Here is no attendees.');
            return;
        }

        for (const attend of data.attendees) {
            let participant = null;
            if (event.id) {
                participant = await this.participantService.findOneByEmail(attend.email);
                participant = participant ? participant : new Participant();
                participant.email = attend.email;
                await this.participantService.save(participant);
            }
            const newAttend = new Attend();
            newAttend.event = event;
            newAttend.participant = participant;
            newAttend.responseStatus = attend.responseStatus;
            newAttend.isResource = attend.resource;
            this.attendService.save(newAttend);
        }
    }

    /**
     * Added to event start and end date if we have it
     * @param {Event} event
     * @param {object} data
     */
    protected async addStartAndEndDates(event: Event, data) {
        if (data.start && data.start.dateTime) {
            event.start = moment(data.start.dateTime).toDate();
        }
        if (data.end && data.end.dateTime) {
            event.end = moment(data.end.dateTime).toDate();
        }
    }
}
