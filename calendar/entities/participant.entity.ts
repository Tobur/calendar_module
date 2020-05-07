import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import { Attend } from './attend.entity';
import { IsEmail, validateOrReject } from 'class-validator';

@Entity('participans')
export class Participant extends BaseEntity {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @type {string}
     */

    @Column({ unique: true })
    @IsEmail()
    email: string;

    /**
     * @type {array} Attend[]
     */
    @OneToMany(
        type => Attend,
        attend => attend.participant,
    )
    attendees: Attend[];

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}
