import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectEventEmitter } from 'nest-emitter';
import { WebHook } from 'src/calendar/entities/web.hook.entity';
import { CalendarEventEmitter } from 'src/calendar/events/calendar.event.emitter';
import { WebHookService } from '../database/web.hook.service';
import { EventHandlerService } from '../google.handlers/event.handler.service';

@Injectable()
export class CalendarEventHandlerService implements OnModuleInit {
    private readonly logger = new Logger(CalendarEventHandlerService.name);
    constructor(
        @InjectEventEmitter() private readonly emitter: CalendarEventEmitter,
        private readonly eventHandlerService: EventHandlerService,
        private readonly webHookService: WebHookService,
    ) {}

    onModuleInit() {
        this.emitter.on(
            'webHookNotification',
            async msg => await this.onWebHookNotification(msg),
        );
    }
    /**
     * @param {WebHook} webHook
     */
    private async onWebHookNotification(webHook: WebHook) {
        this.logger.debug('onWebHookNotification:' + webHook.id);
        this.eventHandlerService.syncEventsPerResourceCalendar(
            webHook.resourceCalendar,
        );
        webHook.isUpToDate = true;
        this.webHookService.save(webHook);
    }
}
