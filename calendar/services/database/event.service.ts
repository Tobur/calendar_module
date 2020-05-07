import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Event } from 'src/calendar/entities/event.entity';
import { ResourceCalendar } from 'src/calendar/entities/resource.calendar.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EventService extends TypeOrmCrudService<Event> {
    /**
     * @param {Repository} eventRepository
     */
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
    ) {
        super(eventRepository);
    }

    /**
     * Return all events
     * @return {array} event[]
     */
    findAll(): Promise<Event[]> {
        return this.eventRepository.find();
    }

    /**
     * Find One by externalId and resource calendar ID
     * @param {ResourceCalendar} resourceCalendar
     * @param {string} externalId
     * @param {Date|null} start
     * @param {Date|null} end
     */
    findOneByExternalIdAndResourceCalendarId(
        resourceCalendar: ResourceCalendar,
        externalId: string,
        start: Date | null,
        end: Date | null,
    ): Promise<Event> {
        if (!start || !end) {
            return this.eventRepository.findOne({
                where: {
                    externalId,
                    resourceCalendar,
                },
                relations: ['resourceCalendar'],
            });
        }

        return this.eventRepository.findOne({
            where: {
                externalId,
                resourceCalendar,
                start,
                end,
            },
            relations: ['resourceCalendar'],
        });
    }

    /**
     * Remove Event
     * @param {number} id
     */
    async remove(id: number): Promise<void> {
        await this.eventRepository.delete(id);
    }

    /**
     * Save event
     * @param {event} event
     */
    async save(event: Event): Promise<Event> {
        return this.eventRepository.save(event);
    }

    /**
     * @param {ResourceCalendar} resourceCalendar
     * @param {Date} end
     * @param {Date} start
     * @returns Promise<boolean>
     */
    async isDuplicated(
        resourceCalendar: ResourceCalendar,
        start: Date,
        end: Date,
    ): Promise<boolean> {
        const count = await this.eventRepository
            .createQueryBuilder('q')
            .leftJoinAndSelect('q.resourceCalendar', 'r')
            .where('r.id = :calendarId', { calendarId: resourceCalendar.id })
            .andWhere('q.start >= :start AND q.end <= :end', { start, end })
            .andWhere('q.status = :status', { status: 'confirmed' })
            .getCount();

        return count > 0 ? true : false;
    }
}
