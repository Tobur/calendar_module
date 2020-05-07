import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { EventDTO } from 'src/api/dto/event.dto';
import * as moment from 'moment';

@ValidatorConstraint({ name: 'dateFrameValidation', async: false })
export class DateFrameValidation implements ValidatorConstraintInterface {
    /**
     * @param {string} text
     * @param {ValidationArguments} args
     */
    validate(text: string, args: ValidationArguments): boolean {
        let eventDTO = args.object;
        if (!(eventDTO instanceof EventDTO)) {
            return true;
        }

        return (
            moment(eventDTO.start)
                .toDate()
                .getTime() <
            moment(eventDTO.end)
                .toDate()
                .getTime()
        );
    }
    /**
     * @param {ValidationArguments} args
     */
    defaultMessage(args: ValidationArguments): string {
        return 'Start date shoule be more than end date!';
    }
}
