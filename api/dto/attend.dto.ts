import { ApiProperty } from '@nestjs/swagger';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

const { CREATE } = CrudValidationGroups;
@Exclude()
export class AttendDTO {
    /**
     * @type {string}
     */
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    @Expose()
    email: string;

    /**
     * @type {string}
     */
    @ApiProperty()
    @Expose()
    responseStatus: string | null = 'needsAction';
}
