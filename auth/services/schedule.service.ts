import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OAuthService } from './database/oauth.service';
import { OAuthGoogleService } from './oauth.google.service';

@Injectable()
export class ScheduleService {
    private readonly logger = new Logger(ScheduleService.name);

    /**
     * @param OAuthGoogleService oauthGoogleService
     * @param OAuthService oauthService
     */
    constructor(
        private oauthGoogleService: OAuthGoogleService,
        private oauthService: OAuthService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleOAuthAccessTokenUpdate() {
        this.logger.debug('Starting to check expired accessToken..');
        const oauths = await this.oauthService.findExpired();

        for (const oauth of oauths) {
            this.oauthGoogleService.refreshToken(oauth);
        }
        this.logger.debug('Finished checks for expired tokens.');
    }
}
