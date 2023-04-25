import {
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
        expect(description.includes('required'));
        // it tells the user the name of the missing property
        expect(description.includes(error.params.missingProperty));
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
        expect(description.includes(error.message));
        // it tells the user what they provided
        expect(description.includes(JSON.stringify(parameterValue)));
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
        expect(description.includes(error.params.pattern));
        // it tells the user which property it pertains to
        expect(description.includes('description'));
        // it tells the user what they provided
        expect(description.includes(requestDescription));
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
        expect(description.includes(error.params.limit.toString()));
        // it tells the user which property it pertains to
        expect(description.includes('description'));
        // it tells the user what they provided
        expect(description.includes(requestDescription));
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
        expect(description.includes(error.params.limit.toString()));
        // it tells the user what kind of comparison it performed
        expect(description.includes(error.params.comparison));
        // it tells the user which property it pertains to
        expect(description.includes('newprop'));
        // it tells the user what they provided
        expect(description.includes(propertyValue.toString()));
    });

    it('Handles multiple errors', () => {
        const errors = [
            {
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

        const error = fromOpenApiValidationErrors({ newprop: 7 }, errors);

        expect(error.name).toBe('ValidationError');
        expect(error.message).toContain('`errors`');
        // @ts-expect-error property exists on validation errors
        expect(error.errors[0].description.includes('newprop'));
        // @ts-expect-error property exists on validation errors
        expect(error.errors[1].description.includes('enabled'));
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
        expect(description.includes('nestedObject.a.b'));
        // it should include the value that the user sent
        expect(description.includes('[]'));
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
        expect(description.includes('nestedObject.a.b'));
        // it should include the value that the user sent
        expect(description.includes(illegalValue));
    });
});
