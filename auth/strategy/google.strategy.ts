import { Injectable, Logger, Next } from '@nestjs/common';
import { OAuth2Strategy } from 'passport-google-oauth';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { OAuth } from '../entities/oauth.entity';
import { OAuthService } from '../services/database/oauth.service';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class GoogleStrategy extends OAuth2Strategy {
    private readonly logger = new Logger(GoogleStrategy.name);
    /**
     *
     * @param {ConfigService} config
     * @param {OAuthService} oauthService
     */
    constructor(
        private config: ConfigService,
        private oauthService: OAuthService,
    ) {
        super(
            {
                clientID: config.get('GOOGLE_CLIENT_ID'),
                clientSecret: config.get('GOOGLE_CLIENT_SECRET'),
                callbackURL: config.get('GOOGLE_CALLBACK_URL'),
                passReqToCallback: true,
                scope: [
                    'openid',
                    'email',
                    'https://www.googleapis.com/auth/calendar',
                    'https://www.googleapis.com/auth/calendar.events',
                    'https://www.googleapis.com/auth/admin.directory.resource.calendar',
                ],
            },
            (req, accessToken, refreshToken, profile, done) => {
                this.logger.debug(profile, 'Google Strategy handle callback.');
                this.getOAuth(profile.id)
                    .then(oauth => {
                        try {
                            if (refreshToken && accessToken) {
                                oauth.refreshToken = refreshToken;
                                oauth.accessToken = accessToken;
                                oauth.expiredAt = moment()
                                    .add(58, 'minutes')
                                    .toDate();
                            }
                            oauth.externalUserId = profile.id;
                            oauth.externalEmail = profile.emails[0].value;
                            this.logger.debug(oauth, 'OAuth created/updated');
                            validate(oauth).then(validationErrors => {
                                if (validationErrors.length > 0) {
                                    this.logger.error(
                                        validationErrors,
                                        GoogleStrategy.name,
                                    );
                                    throw new Error(`Validation failed!`);
                                } else {
                                    oauthService.save(oauth);
                                    done(null, oauth);
                                }
                            });
                        } catch (error) {
                            this.logger.error(error);
                        }
                    })
                    .catch(reason =>
                        this.logger.error(reason, 'Error on oauth 2.0'),
                    );
            },
        );
        passport.use(this);
        passport.serializeUser((user, done) => {
            done(null, user);
        });

        passport.deserializeUser((user, done) => {
            done(null, user);
        });
    }

    /**
     * @param {string} externalUserId
     */
    async getOAuth(externalUserId: string): Promise<OAuth> {
        const oauth = await this.oauthService.findOneByExternalUserId(
            externalUserId,
        );
        if (!oauth) {
            return new OAuth();
        }
        return oauth;
    }
}
