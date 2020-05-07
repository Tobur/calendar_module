import { WebHook } from '../entities/web.hook.entity';
import { StrictEventEmitter } from 'nest-emitter';
import { EventEmitter } from 'events';

interface AppEvents extends EventEmitter {
    webHookNotification: (webHook: WebHook) => void;
}

export type CalendarEventEmitter = StrictEventEmitter<EventEmitter, AppEvents>;
