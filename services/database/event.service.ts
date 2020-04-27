import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Event} from 'src/calendar/entities/event.entity';
import {ResourceCalendar} from 'src/calendar/entities/resource.calendar.entity';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';

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
     */
    findOneByExternalIdAndResourceCalendarId(resourceCalendar: ResourceCalendar, externalId: string): Promise<Event> {
        return this.eventRepository.findOne({
            externalId: externalId,
            resourceCalendar: resourceCalendar,
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
    async save(event: Event) {
        return await this.eventRepository.save(event);
    }
}
