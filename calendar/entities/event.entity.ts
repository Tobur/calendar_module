import {
    IsDefined,
    IsNotEmpty,
    MaxLength,
    IsNumber,
    validateOrReject,
    IsDate,
    IsOptional,
    Validate,
} from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    BaseEntity,
} from 'typeorm';
import { Attend } from './attend.entity';
import { ResourceCalendar } from './resource.calendar.entity';
import { Date2038Validation } from '../validators/date.2038.validation';

@Entity('events')
export class Event extends BaseEntity {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @type {string}
     */
    @Column({ nullable: false })
    @IsDefined()
    @IsNotEmpty()
    @MaxLength(255)
    externalId: string;

    /**
     * @type {string}
     */
    @Column({ nullable: true, default: null })
    @MaxLength(255)
    @IsOptional()
    summary: string;

    /**
     * @type {object} Date
     */
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @IsDefined()
    @IsNotEmpty()
    @IsDate()
    @Validate(Date2038Validation)
    start: Date;

    /**
     * @type {object} Date
     */
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @IsDefined()
    @IsNotEmpty()
    @IsDate()
    @Validate(Date2038Validation)
    end: Date;

    /**
     * @type {string}
     */
    @Column({ type: 'text', nullable: true, default: null })
    description: string;

    /**
     * @type {string}
     */
    @Column()
    @IsDefined()
    @IsNotEmpty()
    @MaxLength(255)
    status: string;

    /**
     * @type {string}
     */
    @Column()
    @MaxLength(255)
    etag: string;

    /**
     * @type {string}
     */
    @Column({ nullable: true })
    @MaxLength(255)
    @IsOptional()
    location: string;

    /**
     * @type {string}
     */
    @Column()
    @MaxLength(255)
    iCalUID: string;

    /**
     * @type {string}
     */
    @Column({ nullable: true })
    @MaxLength(255)
    @IsOptional()
    organizer: string | null;

    /**
     * @type {string}
     */
    @Column({ nullable: true })
    @MaxLength(255)
    creator: string | null;

    /**
     * @type {number}
     */
    @Column({ nullable: true })
    @IsNumber()
    @IsOptional()
    sequence: number | null;

    /**
     * @type {object} ResourceCalendar
     */
    @ManyToOne(
        type => ResourceCalendar,
        resourceCalendar => resourceCalendar.events,
        { nullable: true },
    )
    @IsNotEmpty()
    resourceCalendar: ResourceCalendar;

    /**
     * @type {object} Date
     */
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    /**
     * @type {object} Date
     */
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    /**
     * @type {array} Attend[]
     */
    @OneToMany(
        type => Attend,
        attend => attend.event,
    )
    attendees: Attend[];

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}
