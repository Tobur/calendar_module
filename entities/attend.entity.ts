import {Entity, PrimaryGeneratedColumn, ManyToOne, Column} from 'typeorm';
import {Event} from './event.entity';
import {Participant} from './participant.entity';
import {ApiProperty} from '@nestjs/swagger';

@Entity('attendees')
export class Attend {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;
    /**
     * @type {Event}
     */
    @ManyToOne(type => Event, event => event.attendees, {nullable: false})
    event: Event;

    /**
     * @type {Participant}
     */
    @ApiProperty({type: Participant})
    @ManyToOne(type => Participant, participant => participant.attendees, {nullable: false})
    participant: Participant;

    /**
     * @type {boolean}
     */
    @Column({type: 'bool', default: null})
    isResource: boolean;

    /**
     * @type string
     */
    @Column()
    responseStatus: string;
}
