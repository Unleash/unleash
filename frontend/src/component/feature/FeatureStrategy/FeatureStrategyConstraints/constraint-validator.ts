import type { Input } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/useConstraintInput/useConstraintInput';
import { isValid, parseISO } from 'date-fns';
import semver from 'semver';

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

export const constraintValidator = (input: Input) => {
    switch (input) {
        case 'IN_OPERATORS_LEGAL_VALUES':
        case 'STRING_OPERATORS_LEGAL_VALUES':
        case 'NUM_OPERATORS_LEGAL_VALUES':
        case 'SEMVER_OPERATORS_LEGAL_VALUES':
        case 'IN_OPERATORS_FREETEXT':
        case 'STRING_OPERATORS_FREETEXT':
            return stringListValidator;
        case 'DATE_OPERATORS_SINGLE_VALUE':
            return dateValidator;
        case 'NUM_OPERATORS_SINGLE_VALUE':
            return numberValidator;
        case 'SEMVER_OPERATORS_SINGLE_VALUE':
            return semVerValidator;
    }
};
