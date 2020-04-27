import {Controller, Post, Headers, Logger} from '@nestjs/common';
import {WebHookService} from '../services/database/web.hook.service';

@Controller('notification')

export class NotificationController {
    private readonly logger = new Logger(NotificationController.name);

    /**
     * @param webHookService
     */
    constructor(private webHookService: WebHookService) {
    }

    /**
     * Grab resource id and update WebHook entity flag.
     * @param {object} headers
     */
    @Post()
    async post(@Headers() headers): Promise<string> {
        this.logger.debug(headers, 'WebHook called.');
        const resourceId = headers['x-goog-resource-id'];
        const webHook = await this.webHookService.findOneByResourceId(resourceId);
        if (webHook) {
            webHook.isUpToDate = false;
            this.webHookService.save(webHook);
            this.logger.debug(webHook, 'WebHook entity updated.');
        }

        return 'OK';
    }
}
