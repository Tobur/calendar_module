import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import {Attend} from './attend.entity';
import {ApiProperty} from '@nestjs/swagger';

@Entity('participans')
export class Participant {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Column({unique: true})
    email: string;

    /**
     * @type {array} Attend[]
     */
    @OneToMany(type => Attend, attend => attend.participant)
    attendees: Attend[];
}
