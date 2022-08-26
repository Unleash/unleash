import { isValid, parseISO } from 'date-fns';
import semver from 'semver';

export type ConstraintValidatorOutput = [boolean, string];

export const numberValidatorGenerator = (value: unknown) => {
    return (): ConstraintValidatorOutput => {
        const converted = Number(value);

        if (typeof converted !== 'number' || Number.isNaN(converted)) {
            return [false, 'Value must be a number'];
        }

        return [true, ''];
    };
};

export const stringValidatorGenerator = (values: unknown) => {
    return (): ConstraintValidatorOutput => {
        const error: ConstraintValidatorOutput = [
            false,
            'Values must be a list of strings',
        ];
        if (!Array.isArray(values)) {
            return error;
        }

        if (!values.every(value => typeof value === 'string')) {
            return error;
        }

        return [true, ''];
    };
};

export const semVerValidatorGenerator = (value: string) => {
    return (): ConstraintValidatorOutput => {
        const isCleanValue = semver.clean(value) === value;

        if (!semver.valid(value) || !isCleanValue) {
            return [false, 'Value is not a valid semver. For example 1.2.4'];
        }

        return [true, ''];
    };
};

export const dateValidatorGenerator = (value: string) => {
    return (): ConstraintValidatorOutput => {
        if (!isValid(parseISO(value))) {
            return [false, 'Value must be a valid date matching RFC3339'];
        }
        return [true, ''];
    };
};
