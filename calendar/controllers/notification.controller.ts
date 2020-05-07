import { Controller, Post, Headers, Logger } from '@nestjs/common';
import { WebHookService } from '../services/database/web.hook.service';
import { InjectEventEmitter } from 'nest-emitter';
import { CalendarEventEmitter } from '../events/calendar.event.emitter';

@Controller('notification')
export class NotificationController {
    private readonly logger = new Logger(NotificationController.name);

    /**
     * @param {WebHookService} webHookService
     * @param {CalendarEventEmitter} emitter
     */
    constructor(
        private webHookService: WebHookService,
        @InjectEventEmitter() private readonly emitter: CalendarEventEmitter,
    ) {}

    /**
     * Grab resource id and update WebHook entity flag.
     * @param {object} headers
     */
    @Post()
    async webHook(@Headers() headers): Promise<string> {
        this.logger.debug(headers, 'WebHook called.');
        const resourceId = headers['x-goog-resource-id'];
        const webHook = await this.webHookService.findOneByResourceId(
            resourceId,
        );
        if (webHook) {
            webHook.isUpToDate = false;
            this.webHookService.save(webHook);
            this.emitter.emit('webHookNotification', webHook);
            this.logger.debug(
                webHook.resourceCalendar.id,
                'WebHook entity updated for resourceCalendarId.',
            );
        }
        this.logger.debug('Return response.');

        return 'OK';
    }
}
