import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    Column,
    UpdateDateColumn,
    CreateDateColumn,
    JoinColumn,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import { ResourceCalendar } from './resource.calendar.entity';
import {
    MaxLength,
    IsNotEmpty,
    IsDate,
    IsBoolean,
    validateOrReject,
} from 'class-validator';

@Entity('web_hooks')
export class WebHook extends BaseEntity {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @type {string}
     */
    @MaxLength(255)
    @IsNotEmpty()
    @Column({ unique: true })
    uuid: string;

    /**
     * @type {string}
     */
    @MaxLength(255)
    @IsNotEmpty()
    @Column()
    kind: string;

    /**
     * @type {string}
     */
    @IsNotEmpty()
    @MaxLength(255)
    @Column()
    externalId: string;

    /**
     * @type {string}
     */
    @IsNotEmpty()
    @MaxLength(255)
    @Column()
    resourceId: string;

    /**
     * @type {object} Date
     */
    @IsNotEmpty()
    @IsDate()
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    expiration: Date;

    /**
     * @type {object} ResourceCalendar
     */
    @IsNotEmpty()
    @OneToOne(
        type => ResourceCalendar,
        resourceCalendar => resourceCalendar.webHook,
        { nullable: false },
    )
    @JoinColumn()
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
     * @type {boolean}
     */
    @IsBoolean()
    @Column({ nullable: false })
    isUpToDate: boolean;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}
