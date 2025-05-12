import { isValid, parseISO } from 'date-fns';
import semver from 'semver';
import {
    type EditableConstraint,
    isDateConstraint,
    isNumberConstraint,
    isSemVerConstraint,
} from './editable-constraint-type';
export type ConstraintValidationResult = [boolean, string];

const numberValidator = (value: string): ConstraintValidationResult => {
    const converted = Number(value);

    if (typeof converted !== 'number' || Number.isNaN(converted)) {
        if (typeof value === 'string' && value.includes(',')) {
            return [
                false,
                'Comma (",") is not valid as a decimal separator. Use a period (".") instead.',
            ];
        }
        return [false, 'Value must be a number'];
    }

    return [true, ''];
};

const stringListValidator = (
    ...values: string[]
): ConstraintValidationResult => {
    const error: ConstraintValidationResult = [
        false,
        'Values must be a list of strings',
    ];
    if (!Array.isArray(values)) {
        return error;
    }

    if (!values.every((value) => typeof value === 'string')) {
        return error;
    }

    return [true, ''];
};

const semVerValidator = (value: string): ConstraintValidationResult => {
    const isCleanValue = semver.clean(value) === value;

    if (!semver.valid(value) || !isCleanValue) {
        return [false, 'Value is not a valid semver. For example 1.2.4'];
    }

    return [true, ''];
};

const dateValidator = (value: string): ConstraintValidationResult => {
    if (!isValid(parseISO(value))) {
        return [false, 'Value must be a valid date matching RFC3339'];
    }
    return [true, ''];
};

export const constraintValidator = (constraint: EditableConstraint) => {
    if (isDateConstraint(constraint)) {
        return dateValidator;
    }
    if (isSemVerConstraint(constraint)) {
        return semVerValidator;
    }
    if (isNumberConstraint(constraint)) {
        return numberValidator;
    }
    return stringListValidator;
};
