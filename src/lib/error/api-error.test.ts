import { ErrorObject } from 'ajv';
import {
    ApiErrorSchema,
    fromOpenApiValidationError,
    fromOpenApiValidationErrors,
} from './api-error';

describe('OpenAPI error conversion', () => {
    it('Gives useful error messages for missing properties', () => {
        const error = {
            keyword: 'required',
            instancePath: '',
            dataPath: '.body',
            schemaPath: '#/components/schemas/addonCreateUpdateSchema/required',
            params: {
                missingProperty: 'enabled',
            },
            message: "should have required property 'enabled'",
        };

        const { description } = fromOpenApiValidationError({})(error);

        // it tells the user that the property is required
        expect(description.includes('required')).toBeTruthy();
        // it tells the user the name of the missing property
        expect(description.includes(error.params.missingProperty)).toBeTruthy();
    });

    it('Gives useful error messages for type errors', () => {
        const error = {
            keyword: 'type',
            instancePath: '',
            dataPath: '.body.parameters',
            schemaPath:
                '#/components/schemas/addonCreateUpdateSchema/properties/parameters/type',
            params: {
                type: 'object',
            },
            message: 'should be object',
        };

        const parameterValue = [];
        const { description } = fromOpenApiValidationError({
            parameters: parameterValue,
        })(error);

        // it provides the message
        expect(description.includes(error.message)).toBeTruthy();
        // it tells the user what they provided
        expect(
            description.includes(JSON.stringify(parameterValue)),
        ).toBeTruthy();
    });

    it('Gives useful pattern error messages', () => {
        const error = {
            instancePath: '',
            keyword: 'pattern',
            dataPath: '.body.description',
            schemaPath:
                '#/components/schemas/addonCreateUpdateSchema/properties/description/pattern',
            params: {
                pattern: '^this is',
            },
            message: 'should match pattern "^this is"',
        };

        const requestDescription = 'A pattern that does not match.';
        const { description } = fromOpenApiValidationError({
            description: requestDescription,
        })(error);

        // it tells the user what the pattern it should match is
        expect(description.includes(error.params.pattern)).toBeTruthy();
        // it tells the user which property it pertains to
        expect(description.includes('description')).toBeTruthy();
        // it tells the user what they provided
        expect(description.includes(requestDescription)).toBeTruthy();
    });

    it('Gives useful min/maxlength error messages', () => {
        const error = {
            instancePath: '',
            keyword: 'maxLength',
            dataPath: '.body.description',
            schemaPath:
                '#/components/schemas/addonCreateUpdateSchema/properties/description/maxLength',
            params: {
                limit: 5,
            },
            message: 'should NOT be longer than 5 characters',
        };

        const requestDescription = 'Longer than the max length';
        const { description } = fromOpenApiValidationError({
            description: requestDescription,
        })(error);

        // it tells the user what the pattern it should match is
        expect(
            description.includes(error.params.limit.toString()),
        ).toBeTruthy();
        // it tells the user which property it pertains to
        expect(description.includes('description')).toBeTruthy();
        // it tells the user what they provided
        expect(description.includes(requestDescription)).toBeTruthy();
    });

    it('Handles numerical min/max errors', () => {
        const error = {
            keyword: 'maximum',
            instancePath: '',
            dataPath: '.body.newprop',
            schemaPath:
                '#/components/schemas/addonCreateUpdateSchema/properties/newprop/maximum',
            params: {
                comparison: '<=',
                limit: 5,
                exclusive: false,
            },
            message: 'should be <= 5',
        };

        const propertyValue = 6;
        const { description } = fromOpenApiValidationError({
            newprop: propertyValue,
        })(error);

        // it tells the user what the limit is
        expect(
            description.includes(error.params.limit.toString()),
        ).toBeTruthy();
        // it tells the user what kind of comparison it performed
        expect(description.includes(error.params.comparison)).toBeTruthy();
        // it tells the user which property it pertains to
        expect(description.includes('newprop')).toBeTruthy();
        // it tells the user what they provided
        expect(description.includes(propertyValue.toString())).toBeTruthy();
    });

    it('Handles multiple errors', () => {
        const errors: [ErrorObject, ...ErrorObject[]] = [
            {
                keyword: 'maximum',
                instancePath: '',
                // @ts-expect-error
                dataPath: '.body.newprop',
                schemaPath:
                    '#/components/schemas/addonCreateUpdateSchema/properties/newprop/maximum',
                params: {
                    comparison: '<=',
                    limit: 5,
                    exclusive: false,
                },
                message: 'should be <= 5',
            },
            {
                keyword: 'required',
                instancePath: '',
                dataPath: '.body',
                schemaPath:
                    '#/components/schemas/addonCreateUpdateSchema/required',
                params: {
                    missingProperty: 'enabled',
                },
                message: "should have required property 'enabled'",
            },
        ];

        // create an error and serialize it as it would be shown to the end user.
        const serializedUnleashError: ApiErrorSchema =
            fromOpenApiValidationErrors({ newprop: 7 }, errors).toJSON();

        expect(serializedUnleashError.name).toBe('ValidationError');
        expect(serializedUnleashError.message).toContain('`details`');
        expect(
            serializedUnleashError.details!![0].description.includes('newprop'),
        );
        expect(
            serializedUnleashError.details!![1].description.includes('enabled'),
        );
    });

    describe('Disallowed additional properties', () => {
        it('gives useful messages for base-level properties', () => {
            const openApiError = {
                keyword: 'additionalProperties',
                instancePath: '',
                dataPath: '.body',
                schemaPath:
                    '#/components/schemas/addonCreateUpdateSchema/additionalProperties',
                params: { additionalProperty: 'bogus' },
                message: 'should NOT have additional properties',
            };

            const error = fromOpenApiValidationError({ bogus: 5 })(
                openApiError,
            );

            expect(
                error.description.includes(
                    openApiError.params.additionalProperty,
                ),
            ).toBeTruthy();
            expect(
                error.description
                    .toLowerCase()
                    .includes('additional properties'),
            ).toBeTruthy();
        });

        it('gives useful messages for nested properties', () => {
            const request2 = {
                nestedObject: {
                    nested2: { extraPropertyName: 'illegal property' },
                },
            };
            const openApiError = {
                keyword: 'additionalProperties',
                instancePath: '',
                dataPath: '.body.nestedObject.nested2',
                schemaPath:
                    '#/components/schemas/addonCreateUpdateSchema/properties/nestedObject/properties/nested2/additionalProperties',
                params: { additionalProperty: 'extraPropertyName' },
                message: 'should NOT have additional properties',
            };

            const error = fromOpenApiValidationError(request2)(openApiError);

            console.log(error);

            expect(
                error.description.includes('nestedObject.nested2'),
            ).toBeTruthy();
            expect(
                error.description.includes(
                    openApiError.params.additionalProperty,
                ),
            ).toBeTruthy();
            expect(
                error.description
                    .toLowerCase()
                    .includes('additional properties'),
            ).toBeTruthy();
        });
    });

    it('Handles deeply nested properties gracefully', () => {
        const error = {
            keyword: 'type',
            dataPath: '.body.nestedObject.a.b',
            schemaPath:
                '#/components/schemas/addonCreateUpdateSchema/properties/nestedObject/properties/a/properties/b/type',
            params: { type: 'string' },
            message: 'should be string',
            instancePath: '',
        };

        const { description } = fromOpenApiValidationError({
            nestedObject: { a: { b: [] } },
        })(error);

        // it should hold the full path to the error
        expect(description.includes('nestedObject.a.b')).toBeTruthy();
        // it should include the value that the user sent
        expect(description.includes('[]')).toBeTruthy();
    });

    it('Handles deeply nested properties on referenced schemas', () => {
        const error = {
            keyword: 'type',
            dataPath: '.body.nestedObject.a.b',
            schemaPath: '#/components/schemas/parametersSchema/type',
            params: { type: 'object' },
            message: 'should be object',
            instancePath: '',
        };

        const illegalValue = 'illegal string';
        const { description } = fromOpenApiValidationError({
            nestedObject: { a: { b: illegalValue } },
        })(error);

        // it should hold the full path to the error
        expect(description.includes('nestedObject.a.b')).toBeTruthy();
        // it should include the value that the user sent
        expect(description.includes(illegalValue)).toBeTruthy();
    });
});
