import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {google} from 'googleapis';
import * as moment from 'moment';
import {OAuth} from 'src/auth/entities/oauth.entity';
import {OAuthGoogleService} from 'src/auth/services/oauth.google.service';
import {ResourceCalendar} from 'src/calendar/entities/resource.calendar.entity';
import {Event} from 'src/calendar/entities/event.entity';

@Injectable()
export class GoogleService {
    /**
     * @type {OAuth} oauth
     */
    protected oauth: OAuth;
    private readonly logger = new Logger(GoogleService.name);

    /**
     * @param configService
     */
    constructor(private configService: ConfigService, private oauthGoogleService: OAuthGoogleService) {
    }

    /**
     * @param {OAuth} oauth
     */
    initialize(oauth: OAuth) {
        this.oauth = oauth;
    }

    /**
     * Insert event to google calendar
     *
     * @param {Event} eventDTO
     * @param {ResourceCalendar} resourceCalendar
     */
    async insertEvent(eventDTO: Event, resourceCalendar: ResourceCalendar) {
        const attendees = eventDTO.attendees.map(value => {
            return {email: value.participant.email};
        });
        attendees.push({email: resourceCalendar.resourceEmail});
        const event = {
            oauth_token: this.oauth.accessToken,
            calendarId: 'primary',
            requestBody: {
                description: eventDTO.description,
                summary: eventDTO.name,
                sendNotifications: true,
                start: {
                    dateTime: moment(eventDTO.start).format(),
                },
                end: {
                    dateTime: moment(eventDTO.end).format(),
                },
                attendees: attendees,
            },
        };

        return await google.calendar('v3').events.insert(event).catch(async (error) => {
            this.logger.error(error);
            if (error.code === 401) {
                this.logger.error('Catch 401');
                await this.updateAccessToken();
                return this.insertEvent(eventDTO, resourceCalendar);
            }
        });
    }

    /**
     * @param {string} calendarId
     * @param {string|null} nextPageToken
     */
    async getEvents(calendarId: string, nextPageToken: string | null): Promise<any> {
        let data = await google.calendar('v3').events.list({
            oauth_token: this.oauth.accessToken,
            calendarId: calendarId,
            singleEvents: true,
            pageToken: nextPageToken,
            timeMin: moment().toISOString(),
            timeMax: moment().add(31, 'days').toISOString(),
        }).catch(async (error) => {
            this.logger.error(error);
            if (error.code === 401) {
                this.logger.error('Catch 401');
                await this.updateAccessToken();
                return this.getEvents(calendarId, nextPageToken);
            }
        });

        return data;
    }

    /**
     * @param {string} calendarId
     * @param {string|null} nextPageToken
     * @param {string|null} nextSyncToken
     */
    async syncEvents(calendarId: string, nextPageToken: string | null, nextSyncToken: string | null): Promise<any> {
        const data = await google.calendar('v3').events.list({
            oauth_token: this.oauth.accessToken,
            calendarId: calendarId,
            singleEvents: true,
            pageToken: nextPageToken,
            syncToken: nextSyncToken,
        }).catch(async (error) => {
            this.logger.error(error);
            if (error.code === 401) {
                await this.updateAccessToken();
                return this.syncEvents(calendarId, nextPageToken, nextSyncToken);
            }
        });

        return data;
    }

    /**
     * Return calendars data from google
     * @param {string|null} nextPageToken
     * @return {object}
     */
    async getResourcesCalendars(nextPageToken: string | null): Promise<object> {
        const data = await google.admin('directory_v1').resources.calendars.list({
            customer: 'my_customer',
            oauth_token: this.oauth.accessToken,
            pageToken: nextPageToken,
        }).catch(async (error) => {
            this.logger.error(error);
            if (error.code === 401) {
                await this.updateAccessToken();
                return this.getResourcesCalendars(nextPageToken);
            }
        });

        return data;
    }

    /**
     * Watch for changes in google calendars.
     * @param {string} calendarId
     * @param {string} uuid
     */
    async watchCalendarEvents(calendarId: string, uuid: string): Promise<any> {
        const data = await google.calendar('v3').events.watch({
            oauth_token: this.oauth.accessToken,
            calendarId: calendarId,
            requestBody: {
                id: uuid,
                type: 'web_hook',
                address: this.configService.get('GOOGLE_EVENT_WATCH_URL'),
            },
        }).catch(async (error) => {
            this.logger.error(error);
            if (error.code === 401) {
                await this.updateAccessToken();
                return this.watchCalendarEvents(calendarId, uuid);
            }
        });

        return data;
    }

    /**
     * Update access token
     */
    protected async updateAccessToken() {
        this.logger.debug('Updating accessToken');
        this.oauth = await this.oauthGoogleService.refreshToken(this.oauth);
        this.logger.debug('Updated accessToken');
    }
}
