import { isValid, parseISO } from 'date-fns';
import { RE2JS } from 're2js';
import semver from 'semver';
import {
    isDateOperator,
    isInOperator,
    isNumOperator,
    isRegexOperator,
    isSemVerOperator,
    isStringOperator,
    type Operator,
} from 'constants/operators.js';
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

const formatRegexError = (e: unknown): string => {
    const staticMessage = 'Value must be a valid RE2 regex';
    const rawMessage = e instanceof Error ? e.message : '';
    if (!rawMessage) {
        return staticMessage;
    }
    const capitalizedMessage = rawMessage.startsWith('error')
        ? `Error${rawMessage.slice('error'.length)}`
        : rawMessage;
    return `${staticMessage}. ${capitalizedMessage}`;
};

const regexValidator = (value: string): ConstraintValidationResult => {
    try {
        RE2JS.compile(value);
    } catch (e: unknown) {
        return [false, formatRegexError(e)];
    }
    return [true, ''];
};

export const constraintValidator = (operator: Operator) => {
    if (isDateOperator(operator)) {
        return dateValidator;
    }
    if (isSemVerOperator(operator)) {
        return semVerValidator;
    }
    if (isNumOperator(operator)) {
        return numberValidator;
    }
    if (isRegexOperator(operator)) {
        return regexValidator;
    }
    if (isStringOperator(operator) || isInOperator(operator)) {
        return stringListValidator;
    }
    throw new Error(`Unknown operator: ${operator}`);
};
