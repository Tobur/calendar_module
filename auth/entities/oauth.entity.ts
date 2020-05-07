import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import { ResourceCalendar } from 'src/calendar/entities/resource.calendar.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsEmail,
    ValidateNested,
    MaxLength,
    IsDate,
    validateOrReject,
} from 'class-validator';

@Entity('oauths')
export class OAuth extends BaseEntity {
    /**
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @type {string}
     */
    @Column({ length: 500 })
    @IsNotEmpty()
    @MaxLength(500)
    accessToken: string;

    /**
     * @type {string}
     */
    @Column({ nullable: false, length: 500 })
    @IsNotEmpty()
    @MaxLength(500)
    refreshToken: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Column()
    @IsNotEmpty()
    @MaxLength(255)
    externalUserId: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Column({ unique: true })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    externalEmail: string;

    /**
     * @type {Date}
     */
    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date;

    /**
     * @type {Date}
     */
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    /**
     * @type {Date}
     */
    @Column({ type: 'timestamp', nullable: true, default: null })
    @IsNotEmpty()
    @IsDate()
    expiredAt: Date;

    /**
     * @type {Array}
     */
    @ValidateNested({ always: true })
    @OneToMany(
        type => ResourceCalendar,
        resourceCalendar => resourceCalendar.oauth,
    )
    resourceCalendar: ResourceCalendar;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}
