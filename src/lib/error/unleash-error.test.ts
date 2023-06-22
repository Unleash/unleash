import owasp from 'owasp-password-strength-test';
import { ErrorObject } from 'ajv';
import AuthenticationRequired from '../types/authentication-required';
import { ApiErrorSchema } from './unleash-error';
import BadDataError, {
    fromOpenApiValidationError,
    fromOpenApiValidationErrors,
} from './bad-data-error';
import NoAccessError from './no-access-error';
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
                    description: message,
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

        const result = fromOpenApiValidationError({})(error);

        expect(result).toMatchObject({
            description:
                // it tells the user that the property is required
                expect.stringContaining('required') &&
                // it tells the user the name of the missing property
                expect.stringContaining(error.params.missingProperty),
            path: 'enabled',
        });
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
        const result = fromOpenApiValidationError({
            parameters: parameterValue,
        })(error);

        expect(result).toMatchObject({
            description:
                // it provides the message
                expect.stringContaining(error.message) &&
                // it tells the user what they provided
                expect.stringContaining(JSON.stringify(parameterValue)),
            path: 'parameters',
        });
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
        const result = fromOpenApiValidationError({
            description: requestDescription,
        })(error);

        expect(result).toMatchObject({
            description:
                expect.stringContaining(error.params.pattern) &&
                expect.stringContaining('description') &&
                expect.stringContaining(requestDescription),
            path: 'description',
        });
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
        const result = fromOpenApiValidationError({
            description: requestDescription,
        })(error);

        expect(result).toMatchObject({
            description:
                // it tells the user what the limit is
                expect.stringContaining(error.params.limit.toString()) &&
                // it tells the user which property it pertains to
                expect.stringContaining('description') &&
                // it tells the user what they provided
                expect.stringContaining(requestDescription),
        });
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
        const result = fromOpenApiValidationError({
            newprop: propertyValue,
        })(error);

        expect(result).toMatchObject({
            description:
                // it tells the user what the limit is
                expect.stringContaining(error.params.limit.toString()) &&
                // it tells the user what kind of comparison it performed
                expect.stringContaining(error.params.comparison) &&
                // it tells the user which property it pertains to
                expect.stringContaining('newprop') &&
                // it tells the user what they provided
                expect.stringContaining(propertyValue.toString()),
        });
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

        expect(serializedUnleashError).toMatchObject({
            name: 'BadDataError',
            message: expect.stringContaining('`details`'),
            details: [
                {
                    description: expect.stringContaining('newprop'),
                },
                {
                    description: expect.stringContaining('enabled'),
                },
            ],
        });
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

            expect(error).toMatchObject({
                description:
                    expect.stringContaining(
                        openApiError.params.additionalProperty,
                    ) &&
                    expect.stringMatching('/\broot\b/i') &&
                    expect.stringMatching(/\badditional properties\b/i),
                path: 'bogus',
            });
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

            expect(error).toMatchObject({
                description:
                    expect.stringContaining('nestedObject.nested2') &&
                    expect.stringContaining(
                        openApiError.params.additionalProperty,
                    ) &&
                    expect.stringMatching(/\badditional properties\b/i),
                path: 'nestedObject.nested2.extraPropertyName',
            });
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

        const result = fromOpenApiValidationError({
            nestedObject: { a: { b: [] } },
        })(error);

        expect(result).toMatchObject({
            description:
                expect.stringMatching(/\bnestedObject.a.b\b/) &&
                expect.stringContaining('[]'),
            path: 'nestedObject.a.b',
        });
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
        const result = fromOpenApiValidationError({
            nestedObject: { a: { b: illegalValue } },
        })(error);

        expect(result).toMatchObject({
            description:
                expect.stringMatching(/\bnestedObject.a.b\b/) &&
                expect.stringContaining(illegalValue),
            path: 'nestedObject.a.b',
        });
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

            expect(convertedError.toJSON()).toMatchObject({
                message:
                    expect.stringContaining('validation error') &&
                    expect.stringContaining('details'),
                details: [
                    {
                        description:
                            '"value" must contain at least 1 items. You provided [].',
                    },
                ],
            });
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
        const error = new NoAccessError(permission);
        const json = error.toJSON();

        expect(json.permissions).toStrictEqual([permission]);
    });

    it('NoAccessError: supports multiple permissions', () => {
        const permission = ['x', 'y', 'z'];
        const error = new NoAccessError(permission);
        const json = error.toJSON();

        expect(json.permissions).toStrictEqual(permission);
    });

    it('BadDataError: adds `details` with error details', () => {
        const description = 'You did **this** wrong';
        const error = new BadDataError(description).toJSON();

        expect(error).toMatchObject({
            details: [
                {
                    message: description,
                    description,
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

    it('ProjectWithoutOwnerError: adds `validationErrors: []` to the `details` list', () => {
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
    it('captures stack traces regardless of whether `Error.captureStackTrace` is called explicitly or not', () => {
        const e = new PasswordUndefinedError();

        expect(e.stack).toBeTruthy();
    });
});
