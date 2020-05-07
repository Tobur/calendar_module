import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { ResourceCalendarService } from 'src/calendar/services/database/resource.calendar.service';
import { ResourceCalendar } from 'src/calendar/entities/resource.calendar.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('resources.calendar')
@Crud({
    params: {
        userId: {
            field: 'oauth',
            type: 'number',
        },
    },
    query: {
        maxLimit: 100,
        limit: 10,
        allow: ['resourceName', 'resourceEmail'],
        alwaysPaginate: true,
    },
    routes: {
        only: ['getManyBase', 'getOneBase'],
    },
    model: {
        type: ResourceCalendar,
    },
})
@Controller('/user/:userId/resources/calendar')
export class ResourceCalendarController
    implements CrudController<ResourceCalendar> {
    /**
     *
     * @param {ResourceCalendarService} service
     */
    constructor(public service: ResourceCalendarService) {}
}
