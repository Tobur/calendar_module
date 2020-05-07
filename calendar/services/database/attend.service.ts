import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { Attend } from 'src/calendar/entities/attend.entity';
import { Event } from 'src/calendar/entities/event.entity';

@Injectable()
export class AttendService {
    /**
     * @param {Repository} attendRepository
     */
    constructor(
        @InjectRepository(Attend)
        private attendRepository: Repository<Attend>,
    ) {}

    /**
     * Return all attends
     * @return Attend[]
     */
    findAll(): Promise<Attend[]> {
        return this.attendRepository.find();
    }

    /**
     * Find one Attend
     * @param {number} id
     */
    findOne(id: number): Promise<Attend> {
        return this.attendRepository.findOne(id);
    }

    /**
     * Find attend by event
     * @param {Event} event
     */
    findByEvent(event: Event): Promise<Attend[]> {
        return this.attendRepository.find({ event });
    }

    /**
     * Remove entity by id
     * @param {number} id
     */
    async remove(id: number): Promise<void> {
        await this.attendRepository.delete(id);
    }

    /**
     * Save entity
     * @param {Attend} attend
     */
    async save(attend: Attend): Promise<Attend> {
        return await this.attendRepository.save(attend);
    }

    /**
     * Delete attendees
     * @param {Event} event
     */
    deleteAttendees(event: Event): Promise<DeleteResult> {
        return this.attendRepository
            .createQueryBuilder('q')
            .delete()
            .where('eventId = :id', { id: event.id })
            .execute();
    }
}
