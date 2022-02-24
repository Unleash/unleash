import { constraintNumberTypeSchema } from './constraint-value-types';

test('should require number', async () => {
    try {
        await constraintNumberTypeSchema.validateAsync('test');
    } catch (error) {
        expect(error.details[0].message).toEqual('"value" must be a number');
    }
});

test('should allow strings that can be parsed to a number', async () => {
    await constraintNumberTypeSchema.validateAsync('5');
});

test('should allow floating point numbers', async () => {
    await constraintNumberTypeSchema.validateAsync(5.72);
});

test('should allow numbers', async () => {
    await constraintNumberTypeSchema.validateAsync(5);
});

test('should allow negative numbers', async () => {
    await constraintNumberTypeSchema.validateAsync(-5);
});
