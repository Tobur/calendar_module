import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ResourceCalendar} from 'src/calendar/entities/resource.calendar.entity';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';

@Injectable()
export class ResourceCalendarService extends TypeOrmCrudService<ResourceCalendar> {
    /**
     * @param {Repository} resourceCalendarRepository
     */
    constructor(
        @InjectRepository(ResourceCalendar)
        private resourceCalendarRepository: Repository<ResourceCalendar>,
    ) {
        super(resourceCalendarRepository);
    }

    /**
     * @return {array}
     */
    findAll(): Promise<ResourceCalendar[]> {
        return this.resourceCalendarRepository.find({relations: ['oauth', 'webHook']});
    }

    /**
     * @param {string} resourceId
     * @return {ResourceCalendar}
     */
    findOneByResourceId(resourceId: string): Promise<ResourceCalendar> {
        return this.resourceCalendarRepository.findOne({resourceId: resourceId});
    }

    /**
     * @param {number} id
     */
    async remove(id: number): Promise<void> {
        await this.resourceCalendarRepository.delete(id);
    }

    /**
     * @param {ResourceCalendar} resourceCalendar
     * @return {ResourceCalendar}
     */
    async save(resourceCalendar: ResourceCalendar) {
        return await this.resourceCalendarRepository.save(resourceCalendar);
    }

    /**
     * @param {number} calendarId
     * @param {number} oauthId
     * @return {ResourceCalendar}
     */
    findCalendarByCalendarIdAndUserId(calendarId: number, oauthId: number): Promise<ResourceCalendar> {
        return this.resourceCalendarRepository
            .createQueryBuilder('q')
            .leftJoinAndSelect('q.oauth', 'oauth')
            .where('q.id = :calendarId', {calendarId: calendarId})
            .andWhere('oauth.id = :oauthId', {oauthId: oauthId})
            .getOne();
    }
}
