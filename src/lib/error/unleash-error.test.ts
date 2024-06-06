import owasp from 'owasp-password-strength-test';
import type { ErrorObject } from 'ajv';
import AuthenticationRequired from '../types/authentication-required';
import type { ApiErrorSchema } from './unleash-error';
import BadDataError, {
    fromOpenApiValidationError,
    fromOpenApiValidationErrors,
} from './bad-data-error';
import PermissionError from './permission-error';
import OwaspValidationError from './owasp-validation-error';
import IncompatibleProjectError from './incompatible-project-error';
import PasswordUndefinedError from './password-undefined';
import ProjectWithoutOwnerError from './project-without-owner-error';
import NotFoundError from './notfound-error';
import { validateString } from '../util/validators/constraint-types';
import { fromLegacyError } from './from-legacy-error';

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
    test('Moves message to the details list for baddataerror', () => {
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
    test('Gives useful error messages for missing properties', () => {
        const error = {
            keyword: 'required',
            instancePath: '/body',
            schemaPath: '#/components/schemas/addonCreateUpdateSchema/required',
            params: {
                missingProperty: 'enabled',
            },
            message: "should have required property 'enabled'",
        };

        const result = fromOpenApiValidationError({})(error);

        expect(result).toMatchObject({
            message:
                // it tells the user that the property is required
                expect.stringContaining('required'),
            path: 'enabled',
        });

        // it tells the user the name of the missing property
        expect(result.message).toContain(error.params.missingProperty);
    });

    test('Gives useful error messages for type errors', () => {
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
            parameters: parameterValue,
        })(error);

        expect(result).toMatchObject({
            message:
                // it provides the message
                expect.stringContaining(error.message),
            path: 'parameters',
        });

        // it tells the user what they provided
        expect(result.message).toContain(JSON.stringify(parameterValue));
    });

    it.each(['/body', '/body/subObject'])(
        'Gives useful error messages for oneOf errors in %s',
        (instancePath) => {
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
                secret: 'blah',
                username: 'string2',
                type: 'admin',
            })(error);

            expect(result).toMatchObject({
                message:
                    // it provides the message
                    expect.stringContaining(error.message),
                path: instancePath.substring('/body/'.length),
            });

            // it tells the user what happened
            expect(result.message).toContain('matches more than one option');
            // it tells the user what part of the request body this pertains to
            expect(result.message).toContain(
                instancePath === '/body'
                    ? 'root object'
                    : `"${instancePath.substring('/body/'.length)}" property`,
            );
        },
    );

    test('Gives useful pattern error messages', () => {
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
            description: requestDescription,
        })(error);

        expect(result).toMatchObject({
            message: expect.stringContaining(error.params.pattern),
            path: 'description',
        });
        expect(result.message).toContain('description');
    });

    test('Gives useful enum error messages', () => {
        const error = {
            instancePath: '/body/0/weightType',
            schemaPath: '#/properties/weightType/enum',
            keyword: 'enum',
            params: { allowedValues: ['variable', 'fix'] },
            message: 'must be equal to one of the allowed values',
        };

        const request = [
            {
                name: 'variant',
                weight: 500,
                weightType: 'party',
                stickiness: 'userId',
            },
        ];

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

    test('Gives useful min/maxlength error messages', () => {
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
            description: requestDescription,
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

    test('Handles numerical min/max errors', () => {
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
            newprop: propertyValue,
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

    test('Handles multiple errors', () => {
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

    describe('Disallowed additional properties', () => {
        test('gives useful messages for base-level properties', () => {
            const openApiError = {
                keyword: 'additionalProperties',
                instancePath: '/body',
                schemaPath:
                    '#/components/schemas/addonCreateUpdateSchema/additionalProperties',
                params: { additionalProperty: 'bogus' },
                message: 'should NOT have additional properties',
            };

            const error = fromOpenApiValidationError({ bogus: 5 })(
                openApiError,
            );

            expect(error).toMatchObject({
                message: expect.stringContaining(
                    openApiError.params.additionalProperty,
                ),
                path: 'bogus',
            });

            expect(error.message).toMatch(/\broot\b/i);
            expect(error.message).toMatch(/\badditional properties\b/i);
        });

        test('gives useful messages for nested properties', () => {
            const request2 = {
                nestedObject: {
                    nested2: { extraPropertyName: 'illegal property' },
                },
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
                message: expect.stringContaining('nestedObject/nested2'),
                path: 'nestedObject/nested2/extraPropertyName',
            });

            expect(error.message).toContain(
                openApiError.params.additionalProperty,
            );
            expect(error.message).toMatch(/\badditional properties\b/i);
        });
    });

    test('Handles deeply nested properties gracefully', () => {
        const error = {
            keyword: 'type',
            instancePath: '/body/nestedObject/a/b',
            schemaPath:
                '#/components/schemas/addonCreateUpdateSchema/properties/nestedObject/properties/a/properties/b/type',
            params: { type: 'string' },
            message: 'should be string',
        };

        const result = fromOpenApiValidationError({
            nestedObject: { a: { b: [] } },
        })(error);

        expect(result).toMatchObject({
            message: expect.stringMatching(/\bnestedObject\/a\/b\b/),
            path: 'nestedObject/a/b',
        });

        expect(result.message).toContain('[]');
    });

    test('Handles deeply nested properties on referenced schemas', () => {
        const error = {
            keyword: 'type',
            instancePath: '/body/nestedObject/a/b',
            schemaPath: '#/components/schemas/parametersSchema/type',
            params: { type: 'object' },
            message: 'should be object',
        };

        const illegalValue = 'illegal string';
        const result = fromOpenApiValidationError({
            nestedObject: { a: { b: illegalValue } },
        })(error);

        expect(result).toMatchObject({
            message: expect.stringContaining(illegalValue),
            path: 'nestedObject/a/b',
        });

        expect(result.message).toMatch(/\bnestedObject\/a\/b\b/);
    });
});

describe('Error serialization special cases', () => {
    test('OwaspValidationErrors: adds `validationErrors` to `details`', () => {
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

    test('Converts Joi errors in a sensible fashion', async () => {
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
    test('AuthenticationRequired: adds `path` and `type`', () => {
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

    test('AuthenticationRequired adds `options` if they are present', () => {
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

    test('NoAccessError: adds `permissions`', () => {
        const permission = 'x';
        const error = new PermissionError(permission);
        const json = error.toJSON();

        expect(json.permissions).toStrictEqual([permission]);
    });

    test('NoAccessError: supports multiple permissions', () => {
        const permission = ['x', 'y', 'z'];
        const error = new PermissionError(permission);
        const json = error.toJSON();

        expect(json.permissions).toStrictEqual(permission);
    });

    test('BadDataError: adds `details` with error details', () => {
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

    test('OwaspValidationErrors: adds `validationErrors` to `details`', () => {
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

    test('IncompatibleProjectError: adds `validationErrors: []` to the `details` list', () => {
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

    test('PasswordUndefinedError: adds `validationErrors: []` to the `details` list', () => {
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

    test('ProjectWithoutOwnerError: adds `validationErrors: []` to the `details` list', () => {
        const error = new ProjectWithoutOwnerError();
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
    test('captures stack traces regardless of whether `Error.captureStackTrace` is called explicitly or not', () => {
        const e = new PasswordUndefinedError();

        expect(e.stack).toBeTruthy();
    });
});
