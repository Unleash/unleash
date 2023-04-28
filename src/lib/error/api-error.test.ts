import owasp from 'owasp-password-strength-test';
import { ErrorObject } from 'ajv';
import AuthenticationRequired from '../types/authentication-required';
import {
    ApiErrorSchema,
    fromLegacyError,
    fromOpenApiValidationError,
    fromOpenApiValidationErrors,
    UnleashApiErrorNameWithoutExtraData,
    UnleashApiErrorTypes,
    UnleashError,
} from './api-error';
import BadDataError from './bad-data-error';
import NoAccessError from './no-access-error';
import OwaspValidationError from './owasp-validation-error';
import IncompatibleProjectError from './incompatible-project-error';
import PasswordUndefinedError from './password-undefined';
import ProjectWithoutOwnerError from './project-without-owner-error';

describe('v5 deprecation: backwards compatibility', () => {
    it.each(UnleashApiErrorTypes)(
        'Adds details to error type: "%s"',
        (name: UnleashApiErrorNameWithoutExtraData) => {
            const message = `Error type: ${name}`;
            const error = new UnleashError({ name, message }).toJSON();

            expect(error.message).toBe(message);
            expect(error.details).toStrictEqual([
                {
                    message,
                    description: message,
                },
            ]);
        },
    );
});

describe('Standard/legacy error conversion', () => {
    it('Moves message to the details list for baddataerror', () => {
        const message = `: message!`;
        const result = fromLegacyError(new BadDataError(message)).toJSON();

        expect(result.message.includes('`details`')).toBeTruthy();
        expect(result.details).toStrictEqual([
            {
                message,
                description: message,
            },
        ]);
    });
});

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

        console.log(serializedUnleashError);

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
            expect(error.description).toMatch(/\broot\b/i);
            expect(error.description).toMatch(/\badditional properties\b/i);
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
        expect(description).toMatch(/\bnestedObject.a.b\b/);
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
        expect(description).toMatch(/\bnestedObject.a.b\b/);
        // it should include the value that the user sent
        expect(description.includes(illegalValue)).toBeTruthy();
    });
});

describe('Error serialization special cases', () => {
    it('OwaspValidationErrors: adds `validationErrors` to `details`', () => {
        const results = owasp.test('123');
        const error = new OwaspValidationError(results);
        const json = fromLegacyError(error).toJSON();

        expect(json.details!![0].message).toBe(results.errors[0]);
        expect(json.details!![0].validationErrors).toBe(results.errors);
    });
});

// test that password mismatch errors contain the expected props etc. ...

describe('Error serialization special cases', () => {
    it('AuthenticationRequired: adds `path` and `type`', () => {
        const type = 'password';
        const path = '/api/login';
        const error = new AuthenticationRequired({
            type,
            path,
            message: 'this is a message',
        });

        const json = error.toJSON();

        expect(json.path).toBe(path);
        expect(json.type).toBe(type);
    });

    it('NoAccessError: adds `permission`', () => {
        const permission = 'x';
        const error = new NoAccessError(permission);
        const json = error.toJSON();

        expect(json.permission).toBe(permission);
    });

    it('BadDataError: adds `details` with error details', () => {
        const description = 'You did **this** wrong';
        const error = new BadDataError(description).toJSON();

        expect(error.details![0].message).toBe(description);
        expect(error.details![0].description).toBe(description);
    });

    it('OwaspValidationErrors: adds `validationErrors` to `details`', () => {
        const results = owasp.test('123');
        const error = new OwaspValidationError(results);
        const json = error.toJSON();

        expect(json.message).toBe(results.errors[0]);
        expect(json.details![0].message).toBe(results.errors[0]);
        expect(json.details![0].validationErrors).toBe(results.errors);
    });

    it('IncompatibleProjectError: adds `validationErrors: []` to the `details` list', () => {
        const targetProject = 'x';
        const error = new IncompatibleProjectError(targetProject);
        const json = error.toJSON();

        expect(json.details![0].validationErrors).toStrictEqual([]);
        expect(json.details![0].message).toMatch(/\bx\b/);
    });

    it('PasswordUndefinedError: adds `validationErrors: []` to the `details` list', () => {
        const error = new PasswordUndefinedError();
        const json = error.toJSON();

        expect(json.details![0].validationErrors).toStrictEqual([]);
        expect(json.details![0].message).toMatch(json.message);
    });

    it('ProjectWithoutOwnerError: adds `validationErrors: []` to the `details` list', () => {
        const error = new ProjectWithoutOwnerError();
        const json = error.toJSON();

        expect(json.details![0].validationErrors).toStrictEqual([]);
        expect(json.details![0].message).toMatch(json.message);
    });
});

describe('Stack traces', () => {
    it('captures stack traces regardless of whether `Error.captureStackTrace`', () => {
        const e = new PasswordUndefinedError();

        expect(e.stack).toBeTruthy();
    });
});
