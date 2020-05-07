import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { OAuth } from '../entities/oauth.entity';
import { OAuthService } from './database/oauth.service';

@Injectable()
export class OAuthGoogleService {
    private readonly logger = new Logger(OAuthGoogleService.name);

    /**
     * @param {OAuthService} oauthService
     * @param {ConfigService} config
     */
    constructor(
        private oauthService: OAuthService,
        private config: ConfigService,
    ) {}

    /**
     * @param {OAuth} oauth
     */
    async refreshToken(oauth: OAuth): Promise<OAuth> {
        const oauth2client = this.getOAuth2Client();
        oauth2client.credentials = { refresh_token: oauth.refreshToken };
        oauth2client.refreshAccessToken(async (err, tokens) => {
            if (err) {
                return this.logger.error({ error: err, oauth });
            }
            this.logger.debug(
                `Updated access token for id: ${oauth.externalEmail}`,
            );
            oauth.accessToken = tokens.access_token;
            oauth.refreshToken = tokens.refresh_token;
            oauth.expiredAt = moment(tokens.expiry_date).toDate();
            await this.oauthService.save(oauth);
        });

        return oauth;
    }

    /**
     * @returns {OAuth2Client}
     */
    protected getOAuth2Client() {
        return new google.auth.OAuth2(
            this.config.get('GOOGLE_CLIENT_ID'),
            this.config.get('GOOGLE_CLIENT_SECRET'),
            this.config.get('GOOGLE_CALLBACK_URL'),
        );
    }
}
