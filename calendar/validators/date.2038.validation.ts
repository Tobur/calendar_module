import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import * as moment from 'moment';

@ValidatorConstraint({ name: 'date2038', async: false })
export class Date2038Validation implements ValidatorConstraintInterface {
    /**
     * @param {Date} date
     * @param {ValidationArguments} args
     * @return boolean
     */
    validate(date: Date, args: ValidationArguments): boolean {
        return !moment(date).isAfter('2038-01-19T00:00:00');
    }
    /**
     * @param {ValidationArguments} args
     * @return string
     */
    defaultMessage(args: ValidationArguments): string {
        return 'Start date shoule less than 2038-01-19T00:00:00';
    }
}
