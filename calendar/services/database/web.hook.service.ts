import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebHook } from 'src/calendar/entities/web.hook.entity';

@Injectable()
export class WebHookService {
    /**
     * @param {Repository} webHookRepository
     */
    constructor(
        @InjectRepository(WebHook)
        private webHookRepository: Repository<WebHook>,
    ) {}

    /**
     * Return all WebHooks
     * @return {array}
     */
    findAll(): Promise<WebHook[]> {
        return this.webHookRepository.find();
    }

    /**
     * Find by ID WebHook
     * @param {number} id
     */
    findOne(id: number): Promise<WebHook> {
        return this.webHookRepository.findOne(id);
    }

    /**
     * Remove by ID WebHook
     * @param {number} id
     */
    async remove(id: number): Promise<void> {
        await this.webHookRepository.delete(id);
    }

    /**
     * Save WebHook
     * @param {WebHook} webHook
     * @return {WebHook}
     */
    async save(webHook: WebHook) {
        return await this.webHookRepository.save(webHook);
    }

    /**
     * Find expired webHooks
     * @return {array}
     */
    findExpired(): Promise<WebHook[]> {
        return this.webHookRepository
            .createQueryBuilder('q')
            .leftJoinAndSelect('q.resourceCalendar', 'resourceCalendar')
            .leftJoinAndSelect('resourceCalendar.oauth', 'oauth')
            .where('q.expiration < NOW()')
            .orWhere('q.expiration is NULL')
            .getMany();
    }

    /**
     * @return {array}
     */
    findOutOfDate(): Promise<WebHook[]> {
        return this.webHookRepository
            .createQueryBuilder('q')
            .leftJoinAndSelect('q.resourceCalendar', 'resourceCalendar')
            .leftJoinAndSelect('resourceCalendar.oauth', 'oauth')
            .where('q.isUpToDate = 0 ')
            .orWhere('q.isUpToDate is NULL')
            .getMany();
    }

    /**
     * Return WebHook by resourceId
     * @param {string} resourceId
     */
    async findOneByResourceId(resourceId: string): Promise<WebHook> {
        return this.webHookRepository
            .createQueryBuilder('q')
            .leftJoinAndSelect('q.resourceCalendar', 'resourceCalendar')
            .leftJoinAndSelect('resourceCalendar.oauth', 'oauth')
            .where('q.resourceId = :resourceId', { resourceId })
            .getOne();
    }
}
