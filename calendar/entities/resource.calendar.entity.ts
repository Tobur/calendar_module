import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    UpdateDateColumn,
    CreateDateColumn,
    OneToOne,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import { OAuth } from 'src/auth/entities/oauth.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Event } from './event.entity';
import { WebHook } from './web.hook.entity';
import {
    IsNotEmpty,
    MaxLength,
    IsNumber,
    validateOrReject,
} from 'class-validator';

@Entity('resource_calendars')
export class ResourceCalendar extends BaseEntity {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @type {string}
     */
    @Column()
    @IsNotEmpty()
    @MaxLength(255)
    @ApiProperty()
    resourceId: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Column()
    @IsNotEmpty()
    @MaxLength(255)
    resourceName: string;

    /**
     * @type {string}
     */
    @IsNotEmpty()
    @MaxLength(255)
    @Column()
    etags: string;

    /**
     * @type {string}
     */
    @IsNotEmpty()
    @MaxLength(255)
    @Column()
    generatedResourceName: string;

    /**
     * @type {string}
     */
    @IsNotEmpty()
    @MaxLength(255)
    @Column()
    resourceType: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(255)
    @Column()
    resourceEmail: string;

    /**
     * @type {number}
     */
    @IsNotEmpty()
    @IsNumber()
    @Column()
    capacity: number;

    /**
     * @type {string}
     */
    @MaxLength(255)
    @Column({ nullable: true })
    buildingId: string;

    /**
     * @type {string}
     */
    @MaxLength(255)
    @Column({ nullable: true })
    floorName: string;

    /**
     * @type {string}
     */
    @MaxLength(255)
    @Column({ nullable: true })
    resourceCategory: string;

    /**
     * @type {array} Event[]
     */
    @OneToMany(
        type => Event,
        event => event.resourceCalendar,
    )
    events: Event[];

    /**
     * @type {object} OAuth
     */
    @IsNotEmpty()
    @ManyToOne(
        type => OAuth,
        oauth => oauth.resourceCalendar,
        { nullable: false },
    )
    oauth: OAuth;

    /**
     * @type {object} WebHook
     */
    @OneToOne(
        type => WebHook,
        webHook => webHook.resourceCalendar,
        { nullable: true },
    )
    webHook: WebHook;

    /**
     * @type {string|null}
     */
    @Column({ nullable: true, length: 500 })
    nextSyncToken: string | null;

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

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}
