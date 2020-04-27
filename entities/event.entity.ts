import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, UpdateDateColumn, CreateDateColumn, OneToMany} from 'typeorm';
import {ResourceCalendar} from './resource.calendar.entity';
import {Attend} from './attend.entity';
import {Transform} from 'class-transformer';
import * as moment from 'moment';
import {ApiProperty} from '@nestjs/swagger';

@Entity('events')
export class Event {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @type {string}
     */
    @Column({unique: true, nullable: false})
    externalId: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Column({nullable: true, default: null})
    name: string;

    /**
     * @type {object} Date
     */
    @ApiProperty()
    @Transform(start => moment(start).format())
    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    start: Date;

    /**
     * @type {object} Date
     */
    @ApiProperty()
    @Transform(end => moment(end).format())
    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    end: Date;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Column({type: 'text', nullable: true, default: null})
    description: string;

    /**
     * @type {string}
     */
    @Column()
    status: string;

    /**
     * @type {string}
     */
    @Column()
    etag: string;

    /**
     * @type {string}
     */
    @Column({nullable: true})
    location: string;

    /**
     * @type {string}
     */
    @Column()
    iCalUID: string;

    /**
     * @type {string}
     */
    @Column({nullable: true})
    organizer: string;

    /**
     * @type {string}
     */
    @Column({nullable: true})
    creator: string;

    /**
     * @type {number}
     */
    @Column({nullable: true})
    sequence: number;

    /**
     * @type {object} ResourceCalendar
     */
    @ManyToOne(type => ResourceCalendar, resourceCalendar => resourceCalendar.events, {nullable: true})
    resourceCalendar: ResourceCalendar;

    /**
     * @type {object} Date
     */
    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    /**
     * @type {object} Date
     */
    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    /**
     * @type {array} Attend[]
     */
    @ApiProperty({type: [Attend]})
    @OneToMany(type => Attend, attend => attend.event)
    attendees: Attend[];
}
