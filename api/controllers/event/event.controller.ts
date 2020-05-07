import { Controller, Param, BadRequestException } from '@nestjs/common';
import { CrudController, Crud, ParsedBody, Override } from '@nestjsx/crud';
import { Event } from 'src/calendar/entities/event.entity';
import { EventService } from 'src/calendar/services/database/event.service';
import { ApiTags } from '@nestjs/swagger';
import { ResourceCalendarService } from 'src/calendar/services/database/resource.calendar.service';
import { EventHandlerService } from 'src/calendar/services/google.handlers/event.handler.service';
import { EventDTO } from 'src/api/dto/event.dto';
import * as moment from 'moment';

@ApiTags('event')
@Crud({
    params: {
        calendarId: {
            field: 'resourceCalendar',
            type: 'number',
        },
        userId: {
            field: 'resourceCalendar.oauth',
            type: 'number',
        },
    },
    serialize: {
        get: EventDTO,
    },
    query: {
        maxLimit: 100,
        limit: 10,
        alwaysPaginate: true,
        join: {
            resourceCalendar: {
                eager: true,
            },
            attendees: {
                eager: true,
            },
            'attendees.participant': {
                eager: true,
            },
        },
    },
    routes: {
        only: ['getManyBase', 'getOneBase', 'createOneBase'],
    },
    model: {
        type: EventDTO,
    },
})
@Controller('/user/:userId/resources/calendar/:calendarId/event')
export class EventController implements CrudController<Event> {
    /**
     * @param {EventService} service
     * @param {ResourceCalendarService} resourceCalendarService
     * @param {EventHandlerService} eventHandlerService
     */
    constructor(
        public service: EventService,
        private resourceCalendarService: ResourceCalendarService,
        private eventHandlerService: EventHandlerService,
    ) {}

    /**
     *
     * @param {EventDTO} dto
     * @param {number} userId
     * @param {number} calendarId
     */
    @Override()
    async createOne(
        @ParsedBody() dto: EventDTO,
        @Param('userId') userId: number,
        @Param('calendarId') calendarId: number,
    ): Promise<EventDTO | [] | BadRequestException> {
        const resourceCalendar = await this.resourceCalendarService.findCalendarByCalendarIdAndUserId(
            calendarId,
            userId,
        );
        if (!resourceCalendar) {
            throw new BadRequestException([
                "We don't have resource calendar for this user.",
            ]);
        }
        const isDuplicated = await this.service.isDuplicated(
            resourceCalendar,
            moment(dto.start).toDate(),
            moment(dto.end).toDate(),
        );

        if (isDuplicated) {
            throw new BadRequestException(
                'This time already used for another meeting!',
            );
        }

        const { event, errors } = await this.eventHandlerService.insertEvent(
            dto,
            resourceCalendar,
        );
        if (!event) {
            throw new BadRequestException(errors);
        }
        dto.id = event.id;
        dto.status = event.status;
        dto.externalId = event.externalId;

        return dto;
    }
}
