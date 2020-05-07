import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { OAuthService } from './services/database/oauth.service';
import { OAuth } from './entities/oauth.entity';
import { ScheduleService } from './services/schedule.service';
import { OAuthGoogleService } from './services/oauth.google.service';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([OAuth]),
        ScheduleModule.forRoot(),
    ],
    controllers: [AuthController],
    providers: [
        GoogleStrategy,
        OAuthService,
        ScheduleService,
        OAuthGoogleService,
    ],
})
export class AuthModule {}
