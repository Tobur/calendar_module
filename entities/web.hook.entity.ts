import {Entity, PrimaryGeneratedColumn, OneToOne, Column, UpdateDateColumn, CreateDateColumn, JoinColumn} from 'typeorm';
import {ResourceCalendar} from './resource.calendar.entity';

@Entity('web_hooks')
export class WebHook {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @type {string}
     */
    @Column({unique: true})
    uuid: string;

    /**
     * @type {string}
     */
    @Column()
    kind: string;

    /**
     * @type {string}
     */
    @Column()
    externalId: string;

    /**
     * @type {string}
     */
    @Column()
    resourceId: string;

    /**
     * @type {object} Date
     */
    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    expiration: Date;

    /**
     * @type {object} ResourceCalendar
     */
    @OneToOne(type => ResourceCalendar, resourceCalendar => resourceCalendar.webHook, {nullable: false})
    @JoinColumn()
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
     * @type {boolean}
     */
    @Column({nullable: false})
    isUpToDate: boolean;
}
