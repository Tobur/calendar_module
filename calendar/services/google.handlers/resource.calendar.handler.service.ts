import { Injectable } from '@nestjs/common';
import { OAuth } from 'src/auth/entities/oauth.entity';
import { ResourceCalendar } from 'src/calendar/entities/resource.calendar.entity';
import { WebHook } from 'src/calendar/entities/web.hook.entity';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { WebHookService } from '../database/web.hook.service';
import { ResourceCalendarService } from '../database/resource.calendar.service';
import { GoogleService } from '../google/google.service';

@Injectable()
export class ResourceCalendarHandlerService {
    /**
     * @param {GoogleService} googleService
     * @param {ResourceCalendarService} resourceCalendarService
     * @param {WebHookService} webHookService
     */
    constructor(
        private readonly googleService: GoogleService,
        private readonly resourceCalendarService: ResourceCalendarService,
        private readonly webHookService: WebHookService,
    ) {}

    /**
     * Download and save resource calendars per user
     * @param {OAuth} oauthUser
     */
    async handleResourceCalendarPerUser(oauthUser: OAuth) {
        this.googleService.initialize(oauthUser);
        const nextPageToken = null;
        do {
            const calendars = await this.googleService.getResourcesCalendars(
                nextPageToken,
            );
            for (const element of calendars.data.items) {
                let calendar = await this.resourceCalendarService.findOneByResourceId(
                    element.resourceId,
                );
                calendar = calendar || new ResourceCalendar();
                calendar.resourceCategory = element.resourceCategory;
                calendar.oauth = oauthUser;
                calendar.generatedResourceName = element.generatedResourceName;
                calendar.etags = element.etags;
                calendar.capacity = element.capacity;
                calendar.floorName = element.floorName;
                calendar.resourceEmail = element.resourceEmail;
                calendar.resourceId = element.resourceId;
                calendar.resourceName = element.resourceName;
                calendar.resourceType = element.resourceType;
                calendar.buildingId = element.buildingId;

                await this.resourceCalendarService.save(calendar);
            }
        } while (nextPageToken);
    }

    /**
     * Subscribe to all resource calendars
     * @TODO add pagination
     */
    async subscribeToResourcesCalendars() {
        const resourceCalendars = await this.resourceCalendarService.findAll();
        for (const calendar of resourceCalendars) {
            await this.subscribeToResourcesCalendar(calendar, calendar.oauth);
        }
    }

    /**
     * Subscribe to one resource calendar
     * @param {ResourceCalendar} calendar
     * @param {OAuth} oauthUser
     */
    async subscribeToResourcesCalendar(
        calendar: ResourceCalendar,
        oauthUser: OAuth,
    ) {
        if (calendar.webHook) {
            return;
        }
        this.googleService.initialize(oauthUser);
        const uuid = uuidv4();
        const response = await this.googleService.watchCalendarEvents(
            calendar.resourceEmail,
            uuid,
        );
        const { data } = response;
        const webHook = new WebHook();
        webHook.expiration = moment.unix(data.expiration / 1000).toDate();
        webHook.externalId = data.id;
        webHook.resourceId = data.resourceId;
        webHook.resourceCalendar = calendar;
        webHook.kind = data.kind;
        webHook.uuid = uuid;
        webHook.isUpToDate = false;
        await this.webHookService.save(webHook);
    }
}
