import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, UpdateDateColumn, CreateDateColumn, OneToOne} from 'typeorm';
import {Event} from './event.entity';
import {OAuth} from 'src/auth/entities/oauth.entity';
import {WebHook} from './web.hook.entity';
import {ApiProperty} from '@nestjs/swagger';

@Entity('resource_calendars')
export class ResourceCalendar {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @type {string}
     */
    @Column()
    resourceId: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Column()
    resourceName: string;

    /**
     * @type {string}
     */
    @Column()
    etags: string;

    /**
     * @type {string}
     */
    @Column()
    generatedResourceName: string;

    /**
     * @type {string}
     */
    @Column()
    resourceType: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Column()
    resourceEmail: string;

    /**
     * @type {number}
     */
    @Column()
    capacity: number;

    /**
     * @type {string}
     */
    @Column()
    buildingId: string;

    /**
     * @type {string}
     */
    @Column()
    floorName: string;

    /**
     * @type {string}
     */
    @Column()
    resourceCategory: string;

    /**
     * @type {array} Event[]
     */
    @OneToMany(type => Event, event => event.resourceCalendar)
    events: Event[];

    /**
     * @type {object} OAuth
     */
    @ManyToOne(type => OAuth, oauth => oauth.resourceCalendar, {nullable: false})
    oauth: OAuth;

    /**
     * @type {object} WebHook
     */
    @OneToOne(type => WebHook, webHook => webHook.resourceCalendar, {nullable: true})
    webHook: WebHook;

    /**
     * @type {string|null}
     */
    @Column({nullable: true})
    nextSyncToken: string | null;

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
}
