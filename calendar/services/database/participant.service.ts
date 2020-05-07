import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from 'src/calendar/entities/participant.entity';

@Injectable()
export class ParticipantService {
    /**
     * @param Repository participantRepository
     */
    constructor(
        @InjectRepository(Participant)
        private participantRepository: Repository<Participant>,
    ) {}

    /**
     * Return all participants
     * @return {array}
     */
    findAll(): Promise<Participant[]> {
        return this.participantRepository.find();
    }

    /**
     * Find one participant by ID
     * @param number id
     */
    findOne(id: number): Promise<Participant> {
        return this.participantRepository.findOne(id);
    }

    /**
     * Return one participant by email
     * @param {string} email
     */
    findOneByEmail(email: string): Promise<Participant> {
        return this.participantRepository.findOne({ email });
    }

    /**
     * Remove Participant
     * @param {number} id
     */
    async remove(id: number): Promise<void> {
        await this.participantRepository.delete(id);
    }

    /**
     * Save participant to DB
     * @param participant
     * @return {Participant}
     */
    async save(participant: Participant) {
        return await this.participantRepository.save(participant);
    }

    async getOrCreateParticipant(email: string): Promise<Participant> {
        let participant = await this.findOneByEmail(email);
        participant = participant || new Participant();
        participant.email = email;

        if (!participant.id) {
            await this.save(participant);
        }

        return participant;
    }
}
