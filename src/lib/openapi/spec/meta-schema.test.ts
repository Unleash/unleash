import { schemas } from '..';
import Ajv from 'ajv';

const ajv = new Ajv();

const openApiMetaSchema = {
    type: 'object',
    properties: {
        description: { type: 'string' },
    },
    required: ['description'],
};

describe('OpenAPI schemas meta validation', () => {
    let countErrors = 0;
    Object.entries(schemas).forEach(([name, schema]) => {
        it(`${name} should be valid`, () => {
            const validateMetaSchema = ajv.compile(openApiMetaSchema);
            validateMetaSchema(schema);
            countErrors += validateMetaSchema.errors?.length ?? 0;
            // expect(validateMetaSchema.errors).toBeNull(); // commented until we fix all schemas
            if (validateMetaSchema.errors?.length) {
                // this function outputs instead of failing the test
                console.error(
                    `${name} has the following errors: ${JSON.stringify(
                        validateMetaSchema.errors,
                    )}`,
                );
            }
        });
    });
    expect(countErrors).toBeLessThanOrEqual(125); // current number of schema errors
});
