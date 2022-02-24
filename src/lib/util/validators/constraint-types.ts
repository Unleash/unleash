import {
    constraintNumberTypeSchema,
    constraintStringTypeSchema,
} from 'lib/schema/constraint-value-types';

export const validateNumber = async (value: unknown): Promise<void> => {
    await constraintNumberTypeSchema.validateAsync(value);
};

export const validateString = async (value: unknown): Promise<void> => {
    await constraintStringTypeSchema.validateAsync(value);
};
