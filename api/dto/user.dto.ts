import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class UserDTO {
    /**
     * @type {number}
     */
    @ApiProperty()
    @Expose()
    id: number;

    /**
     * @type {string}
     */
    @Expose()
    @ApiProperty()
    externalEmail: string;
}
