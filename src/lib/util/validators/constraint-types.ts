import {
    constraintDateTypeSchema,
    constraintNumberTypeSchema,
    constraintStringTypeSchema,
} from '../../schema/constraint-value-types.js';
import BadDataError from '../../error/bad-data-error.js';
import type { ILegalValue } from '../../features/context/context-field-store-type.js';
import { parseStrictSemVer } from '../semver.js';

export const validateNumber = async (value: unknown): Promise<void> => {
    await constraintNumberTypeSchema.validateAsync(value);
};

export const validateString = async (value: unknown): Promise<void> => {
    await constraintStringTypeSchema.validateAsync(value);
};

export const validateSemver = (value: unknown): void => {
    if (typeof value !== 'string') {
        throw new BadDataError(`the provided value is not a string.`);
    }

    if (!parseStrictSemVer(value)) {
        throw new BadDataError(
            `the provided value is not a valid semver format. The value provided was: ${value}`,
        );
    }
};

export const validateDate = async (value: unknown): Promise<void> => {
    await constraintDateTypeSchema.validateAsync(value);
};

export const validateLegalValues = (
    legalValues: Readonly<ILegalValue[]>,
    match: string[] | string,
): void => {
    const legalStrings = legalValues.map((legalValue) => {
        return legalValue.value;
    });

    if (Array.isArray(match)) {
        // Compare arrays to arrays
        const valid = match.every((value) => legalStrings.includes(value));
        if (!valid)
            throw new BadDataError(
                `input values are not specified as a legal value on this context field`,
            );
    } else {
        const valid = legalStrings.includes(match);
        if (!valid)
            throw new BadDataError(
                `${match} is not specified as a legal value on this context field`,
            );
    }
};
