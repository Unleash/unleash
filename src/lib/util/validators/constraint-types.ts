import semver from 'semver';

import {
    constraintDateTypeSchema,
    constraintNumberTypeSchema,
    constraintStringTypeSchema,
} from '../../schema/constraint-value-types';
import BadDataError from '../../error/bad-data-error';

export const validateNumber = async (value: unknown): Promise<void> => {
    await constraintNumberTypeSchema.validateAsync(value);
};

export const validateString = async (value: unknown): Promise<void> => {
    await constraintStringTypeSchema.validateAsync(value);
};

export const validateSemver = (value: unknown): void => {
    const result = semver.valid(value);

    if (result) return;
    throw new BadDataError(
        `the provided value is not a valid semver format. The value provided was: ${value}`,
    );
};

export const validateDate = async (value: unknown): Promise<void> => {
    await constraintDateTypeSchema.validateAsync(value);
};

export const validateLegalValues = (
    legalValues: string[],
    match: string[] | string,
): void => {
    if (Array.isArray(match)) {
        // Compare arrays to arrays
        const valid = match.every((value) => legalValues.includes(value));
        if (!valid)
            throw new BadDataError(
                `input values are not specified as a legal value on this context field`,
            );
    } else {
        const valid = legalValues.includes(match);
        if (!valid)
            throw new BadDataError(
                `${match} is not specified as a legal value on this context field`,
            );
    }
};
