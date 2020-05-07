import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { OAuthService } from 'src/auth/services/database/oauth.service';
import { ResourceCalendarService } from '../services/database/resource.calendar.service';
import { EventHandlerService } from '../services/google.handlers/event.handler.service';
import { ResourceCalendarHandlerService } from '../services/google.handlers/resource.calendar.handler.service';

@Injectable()
export class CalendarCommand {
    /**
     * @param oauthService
     * @param resourceCalendarService
     * @param eventHandlerService
     * @param resourceCalendarHandlerService
     */
    constructor(
        private readonly oauthService: OAuthService,
        private readonly resourceCalendarService: ResourceCalendarService,
        private readonly eventHandlerService: EventHandlerService,
        private readonly resourceCalendarHandlerService: ResourceCalendarHandlerService,
    ) {}

    /**
     * Download all events per resource calendar and save it to database.
     * @TODO add pagination
     * @return void
     */
    @Command({
        command: 'download:events',
        describe: 'Download calendar events from google API & save to DB',
        autoExit: true,
    })
    async events() {
        const resourceCalendars = await this.resourceCalendarService.findAll();
        for (const resourceCalendar of resourceCalendars) {
            await this.eventHandlerService.handleEventsPerResourceCalendar(
                resourceCalendar,
            );
        }
    }

    /**
     * Download all resource calendars and save it to database
     * @TODO add pagination
     * @return void
     */
    @Command({
        command: 'download:resource:calendars',
        describe: 'Download resource.calendar from google API & save to DB',
        autoExit: true,
    })
    async resourceCalendars() {
        const oauthUsers = await this.oauthService.findAll();
        for (const oauthUser of oauthUsers) {
            await this.resourceCalendarHandlerService.handleResourceCalendarPerUser(
                oauthUser,
            );
        }
    }

    /**
     * Subscribe to all resource calendar to be able handle webhook
     * @return void
     */
    @Command({
        command: 'subscribe:resource:calendars',
        describe: 'Subscribe to all resource.calendar',
        autoExit: true,
    })
    async watchEventResources() {
        await this.resourceCalendarHandlerService.subscribeToResourcesCalendars();
    }
}
