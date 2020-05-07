import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CalendarModule } from 'src/calendar/calendar.module';
import { ResourceCalendarService } from 'src/calendar/services/database/resource.calendar.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceCalendar } from 'src/calendar/entities/resource.calendar.entity';
import { OAuthService } from 'src/auth/services/database/oauth.service';
import { OAuth } from 'src/auth/entities/oauth.entity';
import { EventService } from 'src/calendar/services/database/event.service';
import { Event } from 'src/calendar/entities/event.entity';
import { EventHandlerService } from 'src/calendar/services/google.handlers/event.handler.service';
import { GoogleService } from 'src/calendar/services/google/google.service';
import { ParticipantService } from 'src/calendar/services/database/participant.service';
import { AttendService } from 'src/calendar/services/database/attend.service';
import { ConfigModule } from '@nestjs/config';
import { OAuthGoogleService } from 'src/auth/services/oauth.google.service';
import { Participant } from 'src/calendar/entities/participant.entity';
import { Attend } from 'src/calendar/entities/attend.entity';
import { UserController } from './controllers/user/user.controller';
import { EventController } from './controllers/event/event.controller';
import { ResourceCalendarController } from './controllers/resource.calendar/resource.calendar.controller';

@Module({
    controllers: [ResourceCalendarController, EventController, UserController],
    imports: [
        AuthModule,
        CalendarModule,
        TypeOrmModule.forFeature([
            ResourceCalendar,
            OAuth,
            Event,
            Participant,
            Attend,
        ]),
        ConfigModule,
    ],
    providers: [
        ResourceCalendarService,
        OAuthService,
        EventService,
        EventHandlerService,
        GoogleService,
        ParticipantService,
        AttendService,
        OAuthGoogleService,
    ],
})
export class ApiModule {}
