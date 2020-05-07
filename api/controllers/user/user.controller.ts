import { Controller } from '@nestjs/common';
import { CrudController, Crud } from '@nestjsx/crud';
import { OAuth } from 'src/auth/entities/oauth.entity';
import { OAuthService } from 'src/auth/services/database/oauth.service';
import { ApiTags } from '@nestjs/swagger';
import { UserDTO } from 'src/api/dto/user.dto';
@ApiTags('user')
@Crud({
    query: {
        maxLimit: 100,
        limit: 10,
        allow: ['externalEmail', 'externalUserId'],
        alwaysPaginate: true,
    },
    routes: {
        only: ['getManyBase', 'getOneBase'],
    },
    model: {
        type: UserDTO,
    },
})
@Controller('user')
export class UserController implements CrudController<OAuth> {
    /**
     * @param OAuthService service
     */
    constructor(public service: OAuthService) {}
}
