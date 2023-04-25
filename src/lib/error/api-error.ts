import { v4 as uuidV4 } from 'uuid';
import { FromSchema } from 'json-schema-to-ts';
import { ErrorObject } from 'ajv';

const UnleashApiErrorTypes = [
    'OwaspValidationError',
    'PasswordUndefinedError',
    'NoAccessError',
    'UsedTokenError',
    'InvalidOperationError',
    'IncompatibleProjectError',
    'OperationDeniedError',
    'NotFoundError',
    'NameExistsError',
    'FeatureHasTagError',
    'RoleInUseError',
    'ProjectWithoutOwnerError',
    'UnknownError',
    'PasswordMismatch',
    'PasswordMismatchError',
    'DisabledError',
    'ContentTypeError',
    'NotImplementedError',

    // server errors; not the end user's fault
    'InternalError',
] as const;

const UnleashApiErrorTypesWithExtraData = [
    'MinimumOneEnvironmentError',
    'BadDataError',
    'BadRequestError',
    'ValidationError',
    'AuthenticationRequired',
    'NoAccessError',
    'InvalidTokenError',
] as const;

const AllUnleashApiErrorTypes = [
    ...UnleashApiErrorTypes,
    ...UnleashApiErrorTypesWithExtraData,
] as const;

type UnleashApiErrorName = typeof AllUnleashApiErrorTypes[number];
type UnleashApiErrorNameWithoutExtraData = Exclude<
    UnleashApiErrorName,
    typeof UnleashApiErrorTypesWithExtraData[number]
>;

const statusCode = (errorName: UnleashApiErrorName): number => {
    switch (errorName) {
        case 'ContentTypeError':
            return 415;
        case 'ValidationError':
            return 400;
        case 'BadDataError':
            return 400;
        case 'BadRequestError':
            return 400;
        case 'OwaspValidationError':
            return 400;
        case 'PasswordUndefinedError':
            return 400;
        case 'MinimumOneEnvironmentError':
            return 400;
        case 'InvalidTokenError':
            return 401;
        case 'NoAccessError':
            return 403;
        case 'UsedTokenError':
            return 403;
        case 'InvalidOperationError':
            return 403;
        case 'IncompatibleProjectError':
            return 403;
        case 'OperationDeniedError':
            return 403;
        case 'NotFoundError':
            return 404;
        case 'NameExistsError':
            return 409;
        case 'FeatureHasTagError':
            return 409;
        case 'RoleInUseError':
            return 400;
        case 'ProjectWithoutOwnerError':
            return 409;
        case 'UnknownError':
            return 500;
        case 'InternalError':
            return 500;
        case 'PasswordMismatch':
        case 'PasswordMismatchError':
            return 401;
        case 'DisabledError':
            return 422;
        case 'NotImplementedError':
            return 405;
        case 'NoAccessError':
            return 403;
        case 'AuthenticationRequired':
            return 401;
    }
};

type ValidationErrorDescription = {
    description: string;
    message: string;
    path?: string;
};

type UnleashErrorData =
    | {
          message: string;
          documentationLink?: string;
      } & (
          | {
                name: UnleashApiErrorNameWithoutExtraData;
            }
          | {
                name: 'NoAccessError';
                permission: string;
            }
          | {
                name: 'AuthenticationRequired';
                path: string;
                type: string;
            }
          | {
                name:
                    | 'ValidationError'
                    | 'BadDataError'
                    | 'BadRequestError'
                    | 'MinimumOneEnvironmentError'
                    | 'InvalidTokenError';
                details: [
                    ValidationErrorDescription,
                    ...ValidationErrorDescription[],
                ];
            }
      );

export class UnleashError extends Error {
    id: string;

    name: UnleashApiErrorName;

    statusCode: number;

    additionalParameters: object;

    constructor({
        name,
        message,
        documentationLink,
        ...rest
    }: UnleashErrorData) {
        super();
        this.id = uuidV4();
        this.name = name;
        super.message = message;

        this.statusCode = statusCode(name);

        this.additionalParameters = rest;
    }

    help(): string {
        return `Get help for id ${this.id}`;
    }

    toJSON(): ApiErrorSchema {
        return {
            id: this.id,
            name: this.name,
            message: this.message,
            ...this.additionalParameters,
        };
    }

    toString(): string {
        return `${this.name}: ${this.message}.`;
    }
}

export const apiErrorSchema = {
    $id: '#/components/schemas/apiError',
    type: 'object',
    required: ['id', 'name', 'message'],
    description:
        'An Unleash API error. Contains information about what went wrong.',
    properties: {
        name: {
            type: 'string',
            enum: AllUnleashApiErrorTypes,
            description:
                'The kind of error that occurred. Meant for machine consumption.',
            example: 'ValidationError',
        },
        id: {
            type: 'string',
            description:
                'A unique identifier for this error instance. Can be used to search logs etc.',
            example: '0b84c7fd-5278-4087-832d-0b502c7929b3',
        },
        message: {
            type: 'string',
            description: 'A human-readable explanation of what went wrong.',
            example:
                "We couldn't find an addon provider with the name that you are trying to add ('bogus-addon')",
        },
    },
    components: {},
} as const;

export const fromLegacyError = (e: Error): UnleashError => {
    const name = AllUnleashApiErrorTypes.includes(e.name as UnleashApiErrorName)
        ? (e.name as UnleashApiErrorName)
        : 'UnknownError';

    if (name === 'NoAccessError') {
        return new UnleashError({
            name,
            message: e.message,
            permission: 'unknown',
        });
    }

    if (
        [
            'ValidationError',
            'BadRequestError',
            'BadDataError',
            'InvalidTokenError',
            'MinimumOneEnvironmentError',
        ].includes(name)
    ) {
        return new UnleashError({
            name: name as
                | 'ValidationError'
                | 'BadRequestError'
                | 'BadDataError'
                | 'InvalidTokenError'
                | 'MinimumOneEnvironmentError',
            message:
                'Your request body failed to validate. Refer to the `details` list to see what happened.',
            details: [{ description: e.message, message: e.message }],
        });
    }

    if (name === 'AuthenticationRequired') {
        return new UnleashError({
            name,
            message: `You must be authenticated to view this content. Please log in.`,
            path: `/err/maybe/login?`,
            type: 'password',
        });
    }

    return new UnleashError({
        name: name as UnleashApiErrorNameWithoutExtraData,
        message: e.message,
    });
};

export const fromOpenApiValidationError =
    (requestBody: object) =>
    (validationError: ErrorObject): ValidationErrorDescription => {
        // @ts-expect-error Unsure why, but the `dataPath` isn't listed on the type definition for error objects. However, it's always there. Suspect this is a bug in the library.
        const propertyName = validationError.dataPath.substring(
            '.body.'.length,
        );
        if (validationError.keyword === 'required') {
            const path =
                propertyName + '.' + validationError.params.missingProperty;
            const description = `The ${path} property is required. It was not present on the data you sent.`;
            return {
                path,
                description,
                message: description,
            };
        } else {
            const youSent = JSON.stringify(requestBody[propertyName]);
            const description = `The .${propertyName} property ${validationError.message}. You sent ${youSent}.`;
            return {
                description,
                message: description,
                path: propertyName,
            };
        }
    };

export const fromOpenApiValidationErrors = (
    requestBody: object,
    validationErrors: [ErrorObject, ...ErrorObject[]],
): UnleashError => {
    const details = validationErrors.map(
        fromOpenApiValidationError(requestBody),
    );

    return new UnleashError({
        name: 'ValidationError',
        message:
            "The request payload you provided doesn't conform to the schema. Check the `details` property for a list of errors that we found.",
        // @ts-expect-error We know that the list is non-empty
        details,
    });
};

export type ApiErrorSchema = FromSchema<typeof apiErrorSchema>;
