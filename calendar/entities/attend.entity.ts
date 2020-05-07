import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import { Event } from './event.entity';
import { Participant } from './participant.entity';
import {
    IsNotEmpty,
    IsBoolean,
    MaxLength,
    validateOrReject,
} from 'class-validator';

@Entity('attendees')
export class Attend extends BaseEntity {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @type {Event}
     */
    @IsNotEmpty()
    @ManyToOne(
        type => Event,
        event => event.attendees,
        { nullable: false },
    )
    event: Event;

    /**
     * @type {Participant}
     */
    @IsNotEmpty()
    @ManyToOne(
        type => Participant,
        participant => participant.attendees,
        { nullable: false },
    )
    participant: Participant;

    /**
     * @type {boolean}
     */
    @IsBoolean()
    @Column({ type: 'bool', default: null })
    isResource: boolean;

    /**
     * @type string
     */
    @IsNotEmpty()
    @MaxLength(255)
    @Column()
    responseStatus: string;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}
