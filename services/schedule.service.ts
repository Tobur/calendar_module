import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebHookService } from './database/web.hook.service';
import { ResourceCalendarHandlerService } from './google.handlers/resource.calendar.handler.service';
import { EventHandlerService } from './google.handlers/event.handler.service';
import { CalendarCommand } from '../commands/calendar.command';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  private readonly webHookService: WebHookService;
  private readonly resourceCalendarHandlerService: ResourceCalendarHandlerService;
  private readonly eventHandlerService: EventHandlerService;
  private readonly calendarCommand: CalendarCommand;

  /**
   * @param {WebHookService} webHookService
   * @param {ResourceCalendarHandlerService} resourceCalendarHandlerService
   * @param {EventHandlerService} eventHandlerService
   * @param {CalendarCommand} calendarCommand
   */
  constructor(
    webHookService: WebHookService,
    resourceCalendarHandlerService: ResourceCalendarHandlerService,
    eventHandlerService: EventHandlerService,
    calendarCommand: CalendarCommand,
  ) {
    this.webHookService = webHookService;
    this.resourceCalendarHandlerService = resourceCalendarHandlerService;
    this.eventHandlerService = eventHandlerService;
    this.calendarCommand = calendarCommand;
  }

  /**
   * Check every minute outdated hook and updated them
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleOutDatedWebHook() {
    const webHooks = await this.webHookService.findExpired();
    this.logger.debug('Starting to check web hooks');
    for (const webHook of webHooks) {
      const calendar = webHook.resourceCalendar;
      this.logger.debug('Update web hook for resource calendar id: ' + calendar.id);
      this.logger.debug('Remove web hook id: ' + webHook.id);
      await this.webHookService.remove(webHook.id);
      calendar.webHook = null;
      await this.resourceCalendarHandlerService.subscribeToResourcesCalendar(calendar, calendar.oauth);
    }

    this.logger.debug('Finished check web hooks');
  }

  /**
   * Sync resource calendars if we have to
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleChangedCalendars() {
    const webHooks = await this.webHookService.findOutOfDate();
    this.logger.debug('Starting check changes in resource calendars');
    for (const webHook of webHooks) {
      this.logger.debug('Sync calendar.', webHook.resourceCalendar.id.toString());
      this.eventHandlerService.syncEventsPerResourceCalendar(webHook.resourceCalendar);
      webHook.isUpToDate = true;
      this.webHookService.save(webHook);
    }
    this.logger.debug('Finished check changes in resource calendars');
  }

  /**
   * Download new events every day at 6AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleNewEvents() {
    this.logger.debug('Starting upload event per resource calendars');
    this.calendarCommand.events();
    this.logger.debug('Finished upload event per calendars');
  }

  /**
   * Download new resource calendars every day at 5AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async handleNewResourceCalendars() {
    this.logger.debug('Starting upload resource calendars');
    this.calendarCommand.resourceCalendars();
    this.logger.debug('Finished upload resource calendars');
  }

  /**
   * Watch event resources every day at 6AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleNewWebHooks() {
    this.logger.debug('Starting attach new web_hook to resource calendars');
    this.calendarCommand.watchEventResources();
    this.logger.debug('Finished attach new web_hook to resource calendars');
  }
}
