import { constraintNumberTypeSchema } from 'lib/schema/constraint-value-types';

export const validateNumber = async (value: unknown): Promise<void> => {
    await constraintNumberTypeSchema.validateAsync(value);
};
