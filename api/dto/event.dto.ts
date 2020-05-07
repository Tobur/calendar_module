import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { CrudValidationGroups } from '@nestjsx/crud';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsNotEmpty,
    MaxLength,
    ValidateNested,
    Validate,
} from 'class-validator';
import * as moment from 'moment';
import { Attend } from 'src/calendar/entities/attend.entity';
import { AttendDTO } from './attend.dto';
import { DateFrameValidation } from '../validators/date.frame.validation';
import { Date2038Validation } from 'src/calendar/validators/date.2038.validation';

const { CREATE } = CrudValidationGroups;

@Exclude()
export class EventDTO {
    /**
     * @type {number}
     */
    @ApiProperty()
    @Expose()
    id: number;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Expose()
    @MaxLength(255, { groups: [CREATE] })
    @IsNotEmpty({ groups: [CREATE] })
    summary: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Expose()
    @Transform(end => moment(end).format())
    @IsDateString({ groups: [CREATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @Validate(DateFrameValidation, { groups: [CREATE] })
    @Validate(Date2038Validation, { groups: [CREATE] })
    start: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Expose()
    @Transform(end => moment(end).format())
    @IsDateString({ groups: [CREATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @Validate(Date2038Validation, { groups: [CREATE] })
    end: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Expose()
    @MaxLength(65000, { groups: [CREATE] })
    description: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Expose()
    status: string;
    /**
     * @type {string}
     */
    @ApiProperty()
    @Expose()
    externalId: string;

    /**
     * @type {Array}
     */
    @ApiProperty()
    @Expose()
    @Transform((attendees): AttendDTO[] => {
        return attendees.map(
            (attend: {
                participant: { email: string };
                responseStatus: string;
            }) => {
                if (attend.participant) {
                    const dto = new AttendDTO();
                    dto.email = attend.participant.email;
                    dto.responseStatus = attend.responseStatus;

                    return dto;
                }

                return attend;
            },
        );
    })
    @IsArray({ groups: [CREATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @ValidateNested({ always: true, groups: [CREATE] })
    @Type(t => AttendDTO)
    @ApiResponseProperty({ type: () => [AttendDTO] })
    attendees: AttendDTO[];
}
