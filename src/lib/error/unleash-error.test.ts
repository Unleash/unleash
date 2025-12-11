import owasp from 'owasp-password-strength-test';
import type { ErrorObject } from 'ajv';
import AuthenticationRequired from '../types/authentication-required.js';
import type { ApiErrorSchema } from './unleash-error.js';
import BadDataError, {
    fromOpenApiValidationError,
    fromOpenApiValidationErrors,
} from './bad-data-error.js';
import PermissionError from './permission-error.js';
import OwaspValidationError from './owasp-validation-error.js';
import IncompatibleProjectError from './incompatible-project-error.js';
import PasswordUndefinedError from './password-undefined.js';
import NotFoundError from './notfound-error.js';
import { validateString } from '../util/validators/constraint-types.js';
import { fromLegacyError } from './from-legacy-error.js';

describe('v5 deprecation: backwards compatibility', () => {
    it(`Adds details to error types that don't specify it`, () => {
        const message = `Error!`;
        const error = new NotFoundError(message).toJSON();

        expect(error).toMatchObject({
            message,
            details: [
                {
                    message,
                },
            ],
        });
    });
});

describe('Standard/legacy error conversion', () => {
    it('Moves message to the details list for baddataerror', () => {
        const message = `: message!`;
        const result = fromLegacyError(new BadDataError(message)).toJSON();

        expect(result.details).toStrictEqual([
            {
                message,
            },
        ]);
    });
});

describe('OpenAPI error conversion', () => {
    it('Gives useful error messages for missing properties', () => {
        const error = {
            keyword: 'required',
            instancePath: '/body',
            schemaPath: '#/components/schemas/addonCreateUpdateSchema/required',
            params: {
                missingProperty: 'enabled',
            },
            message: "should have required property 'enabled'",
        };

        const result = fromOpenApiValidationError({ body: {}, query: {} })(
            error,
        );

        expect(result).toMatchObject({
            message:
                // it tells the user that the property is required
                expect.stringContaining('required'),
            path: '/body/enabled',
        });

        // it tells the user the name of the missing property
        expect(result.message).toContain(error.params.missingProperty);
    });

    it('Gives useful error messages for type errors', () => {
        const error = {
            keyword: 'type',
            instancePath: '/body/parameters',
            schemaPath:
                '#/components/schemas/addonCreateUpdateSchema/properties/parameters/type',
            params: {
                type: 'object',
            },
            message: 'should be object',
        };

        const parameterValue = [];
        const result = fromOpenApiValidationError({
            body: {
                parameters: parameterValue,
            },
            query: {},
        })(error);

        expect(result).toMatchObject({
            message:
                // it provides the message
                expect.stringContaining(error.message),
            path: '/body/parameters',
        });

        // it tells the user what they provided
        expect(result.message).toContain(JSON.stringify(parameterValue));
    });

    it.each([
        '/body',
        '/body/subObject',
    ])('Gives useful error messages for oneOf errors in %s', (instancePath) => {
        const error = {
            keyword: 'oneOf',
            instancePath,
            schemaPath: '#/components/schemas/createApiTokenSchema/oneOf',
            params: {
                passingSchemas: null,
            },
            message: 'should match exactly one schema in oneOf',
        };

        const result = fromOpenApiValidationError({
            body: {
                secret: 'blah',
                username: 'string2',
                type: 'admin',
            },
            query: {},
        })(error);

        expect(result).toMatchObject({
            message:
                // it provides the message
                expect.stringContaining(error.message),
            path: instancePath,
        });

        // it tells the user what happened
        expect(result.message).toContain('matches more than one option');
        // it tells the user what part of the request body this pertains to
        expect(result.message).toContain(`"${instancePath}" property`);
    });

    it('Gives useful pattern error messages', () => {
        const error = {
            keyword: 'pattern',
            instancePath: '/body/description',
            schemaPath:
                '#/components/schemas/addonCreateUpdateSchema/properties/description/pattern',
            params: {
                pattern: '^this is',
            },
            message: 'should match pattern "^this is"',
        };

        const requestDescription = 'A pattern that does not match.';
        const result = fromOpenApiValidationError({
            body: {
                description: requestDescription,
            },
            query: {},
        })(error);

        expect(result).toMatchObject({
            message: expect.stringContaining(error.params.pattern),
            path: '/body/description',
        });
        expect(result.message).toContain('description');
    });

    it('Gives useful enum error messages', () => {
        const error = {
            instancePath: '/body/0/weightType',
            schemaPath: '#/properties/weightType/enum',
            keyword: 'enum',
            params: { allowedValues: ['variable', 'fix'] },
            message: 'must be equal to one of the allowed values',
        };

        const request = {
            body: [
                {
                    name: 'variant',
                    weight: 500,
                    weightType: 'party',
                    stickiness: 'userId',
                },
            ],
            query: {},
        };

        const result = fromOpenApiValidationError(request)(error);

        expect(result).toMatchObject({
            message: expect.stringContaining('weightType'),
            path: 'weightType',
        });
        expect(result.message).toContain('one of the allowed values');
        expect(result.message).toContain('fix');
        expect(result.message).toContain('variable');
        expect(result.message).toContain('party');
    });

    it('Gives useful min/maxlength error messages', () => {
        const error = {
            keyword: 'maxLength',
            instancePath: '/body/description',
            schemaPath:
                '#/components/schemas/addonCreateUpdateSchema/properties/description/maxLength',
            params: {
                limit: 5,
            },
            message: 'should NOT be longer than 5 characters',
        };

        const requestDescription = 'Longer than the max length';
        const result = fromOpenApiValidationError({
            body: {
                description: requestDescription,
            },
            query: {},
        })(error);

        expect(result).toMatchObject({
            message:
                // it tells the user what the limit is
                expect.stringContaining(error.params.limit.toString()),
        });

        // it tells the user which property it pertains to
        expect(result.message).toContain('description');
        // it tells the user what they provided
        expect(result.message).toContain(requestDescription);
    });

    it('Handles numerical min/max errors', () => {
        const error = {
            keyword: 'maximum',
            instancePath: '/body/newprop',
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
        const result = fromOpenApiValidationError({
            body: {
                newprop: propertyValue,
            },
            query: {},
        })(error);

        expect(result).toMatchObject({
            message:
                // it tells the user what the limit is
                expect.stringContaining(error.params.limit.toString()),
        });

        // it tells the user what kind of comparison it performed
        expect(result.message).toContain(error.params.comparison);
        // it tells the user which property it pertains to
        expect(result.message).toContain('newprop');
        // it tells the user what they provided
        expect(result.message).toContain(propertyValue.toString());
    });

    it('Handles multiple errors', () => {
        const errors: [ErrorObject, ...ErrorObject[]] = [
            {
                keyword: 'maximum',
                instancePath: '/body/newprop',
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
                instancePath: '/body',
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
            fromOpenApiValidationErrors(
                { body: { newprop: 7 }, query: {} },
                errors,
            ).toJSON();

        expect(serializedUnleashError).toMatchObject({
            name: 'BadDataError',
            message: expect.stringContaining('`details`'),
            details: [
                {
                    message: expect.stringContaining('newprop'),
                },
                {
                    message: expect.stringContaining('enabled'),
                },
            ],
        });
    });

    it('Handles any data, not only requests', () => {
        const errors: [ErrorObject, ...ErrorObject[]] = [
            {
                keyword: 'maximum',
                instancePath: '/newprop',
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
                instancePath: '/',
                schemaPath:
                    '#/components/schemas/addonCreateUpdateSchema/required',
                params: {
                    missingProperty: 'enabled',
                },
                message: "should have required property 'enabled'",
            },
        ];

        const serializedUnleashError: ApiErrorSchema =
            fromOpenApiValidationErrors({ newprop: 7 }, errors).toJSON();

        expect(serializedUnleashError).toMatchObject({
            name: 'BadDataError',
            message: expect.stringContaining('`details`'),
            details: [
                {
                    message: expect.stringContaining('newprop'),
                },
                {
                    message: expect.stringContaining('enabled'),
                },
            ],
        });
    });

    it('Handles invalid data gracefully', () => {
        const errors: [ErrorObject, ...ErrorObject[]] = [
            {
                keyword: 'maximum',
                instancePath: '/body/newprop',
                schemaPath:
                    '#/components/schemas/addonCreateUpdateSchema/properties/body/newprop/maximum',
                params: {
                    comparison: '<=',
                    limit: 5,
                    exclusive: false,
                },
                message: 'should be <= 5',
            },
        ];

        const serializedUnleashError: ApiErrorSchema =
            fromOpenApiValidationErrors({}, errors).toJSON();

        expect(serializedUnleashError).toMatchObject({
            name: 'BadDataError',
            message: expect.stringContaining('`details`'),
            details: [
                {
                    message: expect.stringContaining('newprop'),
                },
            ],
        });
    });

    describe('Disallowed additional properties', () => {
        it('gives useful messages for base-level properties', () => {
            const openApiError = {
                keyword: 'additionalProperties',
                instancePath: '/body',
                schemaPath:
                    '#/components/schemas/addonCreateUpdateSchema/additionalProperties',
                params: { additionalProperty: 'bogus' },
                message: 'should NOT have additional properties',
            };

            const error = fromOpenApiValidationError({
                body: { bogus: 5 },
                query: {},
            })(openApiError);

            expect(error).toMatchObject({
                message: expect.stringContaining(
                    openApiError.params.additionalProperty,
                ),
                path: '/body/bogus',
            });

            expect(error.message).toMatch(/\bbody\b/i);
            expect(error.message).toMatch(/\badditional properties\b/i);
        });

        it('gives useful messages for nested properties', () => {
            const request2 = {
                body: {
                    nestedObject: {
                        nested2: { extraPropertyName: 'illegal property' },
                    },
                },
                query: {},
            };
            const openApiError = {
                keyword: 'additionalProperties',
                instancePath: '/body/nestedObject/nested2',
                schemaPath:
                    '#/components/schemas/addonCreateUpdateSchema/properties/nestedObject/properties/nested2/additionalProperties',
                params: { additionalProperty: 'extraPropertyName' },
                message: 'should NOT have additional properties',
            };

            const error = fromOpenApiValidationError(request2)(openApiError);

            expect(error).toMatchObject({
                message: expect.stringContaining('/body/nestedObject/nested2'),
                path: '/body/nestedObject/nested2/extraPropertyName',
            });

            expect(error.message).toContain(
                openApiError.params.additionalProperty,
            );
            expect(error.message).toMatch(/\badditional properties\b/i);
        });
    });

    it('Handles deeply nested properties gracefully', () => {
        const error = {
            keyword: 'type',
            instancePath: '/body/nestedObject/a/b',
            schemaPath:
                '#/components/schemas/addonCreateUpdateSchema/properties/nestedObject/properties/a/properties/b/type',
            params: { type: 'string' },
            message: 'should be string',
        };

        const result = fromOpenApiValidationError({
            body: {
                nestedObject: { a: { b: [] } },
            },
            query: {},
        })(error);

        expect(result).toMatchObject({
            message: expect.stringMatching(/\bnestedObject\/a\/b\b/),
            path: '/body/nestedObject/a/b',
        });

        expect(result.message).toContain('[]');
    });

    it('Handles deeply nested properties on referenced schemas', () => {
        const error = {
            keyword: 'type',
            instancePath: '/body/nestedObject/a/b',
            schemaPath: '#/components/schemas/parametersSchema/type',
            params: { type: 'object' },
            message: 'should be object',
        };

        const illegalValue = 'illegal string';
        const result = fromOpenApiValidationError({
            body: {
                nestedObject: { a: { b: illegalValue } },
            },
            query: {},
        })(error);

        expect(result).toMatchObject({
            message: expect.stringContaining(illegalValue),
            path: '/body/nestedObject/a/b',
        });

        expect(result.message).toMatch(/\bnestedObject\/a\/b\b/);
    });

    it('handles query parameter errors', () => {
        const error = {
            instancePath: '/query/from',
            schemaPath: '#/properties/query/properties/from/format',
            keyword: 'format',
            params: { format: 'date' },
            message: 'must match format "date"',
        };
        const query = { from: '01-2020-01' };

        const result = fromOpenApiValidationError({ body: {}, query })(error);

        expect(result).toMatchObject({
            message:
                // it tells the user what the format is
                expect.stringContaining(error.params.format),
        });

        // it tells the user which property it pertains to
        expect(result.message).toContain('from');
        // it tells the user what they provided
        expect(result.message).toContain(query.from);
    });
});

describe('Error serialization special cases', () => {
    it('OwaspValidationErrors: adds `validationErrors` to `details`', () => {
        const results = owasp.test('123');
        const error = new OwaspValidationError(results);
        const json = fromLegacyError(error).toJSON();

        expect(json).toMatchObject({
            details: [
                {
                    message: results.errors[0],
                    validationErrors: results.errors,
                },
            ],
        });
    });

    it('Converts Joi errors in a sensible fashion', async () => {
        // if the validation doesn't fail, this test does nothing, so ensure
        // that an error is thrown.
        let validationThrewAnError = false;
        try {
            await validateString([]);
        } catch (e) {
            validationThrewAnError = true;
            const convertedError = fromLegacyError(e);

            const result = convertedError.toJSON();
            expect(result).toMatchObject({
                message: expect.stringContaining('details'),
                details: [
                    {
                        message:
                            '"value" must contain at least 1 items. You provided [].',
                    },
                ],
            });
            expect(result.message).toContain('validation');
        }

        expect(validationThrewAnError).toBeTruthy();
    });
});

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

        expect(json).toMatchObject({ path, type });
    });

    it('AuthenticationRequired adds `options` if they are present', () => {
        const config = {
            type: 'password',
            path: `base-path/auth/simple/login`,
            message: 'You must sign in order to use Unleash',
            defaultHidden: true,
            options: [
                {
                    type: 'google',
                    message: 'Sign in with Google',
                    path: `base-path/auth/google/login`,
                },
            ],
        };

        const json = new AuthenticationRequired(config).toJSON();

        expect(json).toMatchObject(config);
    });

    it('NoAccessError: adds `permissions`', () => {
        const permission = 'x';
        const error = new PermissionError(permission);
        const json = error.toJSON();

        expect(json.permissions).toStrictEqual([permission]);
    });

    it('NoAccessError: supports multiple permissions', () => {
        const permission = ['x', 'y', 'z'];
        const error = new PermissionError(permission);
        const json = error.toJSON();

        expect(json.permissions).toStrictEqual(permission);
    });

    it('BadDataError: adds `details` with error details', () => {
        const message = 'You did **this** wrong';
        const error = new BadDataError(message).toJSON();

        expect(error).toMatchObject({
            details: [
                {
                    message,
                },
            ],
        });
    });

    it('OwaspValidationErrors: adds `validationErrors` to `details`', () => {
        const results = owasp.test('123');
        const error = new OwaspValidationError(results);
        const json = error.toJSON();

        expect(json).toMatchObject({
            message: results.errors[0],
            details: [
                {
                    message: results.errors[0],
                    validationErrors: results.errors,
                },
            ],
        });
    });

    it('IncompatibleProjectError: adds `validationErrors: []` to the `details` list', () => {
        const targetProject = '8927CCCA-AD39-46E2-9D83-8E50D9AACE75';
        const error = new IncompatibleProjectError(targetProject);
        const json = error.toJSON();

        expect(json).toMatchObject({
            details: [
                {
                    validationErrors: [],
                    message: expect.stringContaining(targetProject),
                },
            ],
        });
    });

    it('PasswordUndefinedError: adds `validationErrors: []` to the `details` list', () => {
        const error = new PasswordUndefinedError();
        const json = error.toJSON();

        expect(json).toMatchObject({
            details: [
                {
                    validationErrors: [],
                    message: json.message,
                },
            ],
        });
    });
});

describe('Stack traces', () => {
    it('captures stack traces regardless of whether `Error.captureStackTrace` is called explicitly or not', () => {
        const e = new PasswordUndefinedError();

        expect(e.stack).toBeTruthy();
    });
});
