import { Controller, Get, Res, Next, Req, Logger } from '@nestjs/common';
import * as passport from 'passport';
import { GoogleStrategy } from './strategy/google.strategy';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(GoogleStrategy.name);
    /**
     * @param {GoogleStrategy} googleStragegy
     */
    constructor(private googleStragegy: GoogleStrategy) {}

    @Get('/')
    authenticate(@Req() request, @Res() response, @Next() next): any {
        passport.initialize();
        passport.use(this.googleStragegy);

        passport.authenticate('google', {
            session: false,
            accessType: 'offline',
            prompt: 'consent',
        })(request, response, next);
    }

    @Get('callback')
    callback(@Req() request, @Res() response, @Next() next): any {
        this.logger.debug(request.query, 'OAuth callback');
        passport.initialize();
        passport.use(this.googleStragegy);
        passport.authenticate(
            'google',
            {
                session: false,
                failureRedirect: '/auth',
            },
            (req, res) => {
                this.logger.debug(req, 'OAuh callback.');
                response.redirect(303, `/`);
            },
        )(request, response, next);
    }
}
