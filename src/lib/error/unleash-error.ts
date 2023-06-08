import { v4 as uuidV4 } from 'uuid';
import { FromSchema } from 'json-schema-to-ts';

export const UnleashApiErrorTypes = [
    'ContentTypeError',
    'DisabledError',
    'FeatureHasTagError',
    'IncompatibleProjectError',
    'InvalidOperationError',
    'InvalidTokenError',
    'MinimumOneEnvironmentError',
    'NameExistsError',
    'NoAccessError',
    'NotFoundError',
    'NotImplementedError',
    'OperationDeniedError',
    'PasswordMismatch',
    'PasswordUndefinedError',
    'ProjectWithoutOwnerError',
    'RoleInUseError',
    'UnknownError',
    'UsedTokenError',
    'BadDataError',
    'ValidationError',
    'AuthenticationRequired',
    'UnauthorizedError',
    'NoAccessError',
    'InvalidTokenError',
    'OwaspValidationError',

    // server errors; not the end user's fault
    'InternalError',
] as const;

export type UnleashApiErrorName = typeof UnleashApiErrorTypes[number];

const statusCode = (errorName: string): number => {
    switch (errorName) {
        case 'ContentTypeError':
            return 415;
        case 'ValidationError':
            return 400;
        case 'BadDataError':
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
            return 401;
        case 'UnauthorizedError':
            return 401;
        case 'DisabledError':
            return 422;
        case 'NotImplementedError':
            return 405;
        case 'NoAccessError':
            return 403;
        case 'AuthenticationRequired':
            return 401;
        case 'BadRequestError': //thrown by express; do not remove
            return 400;
        default:
            return 500;
    }
};

export abstract class UnleashError extends Error {
    id: string;

    name: string;

    statusCode: number;

    additionalParameters: object;

    constructor(message: string, name?: string) {
        super();
        this.id = uuidV4();
        this.name = name || this.constructor.name;
        super.message = message;

        this.statusCode = statusCode(this.name);
    }

    help(): string {
        return `Get help for id ${this.id}`;
    }

    toJSON(): ApiErrorSchema {
        return {
            id: this.id,
            name: this.name,
            message: this.message,
            details: [{ message: this.message, description: this.message }],
        };
    }

    toString(): string {
        return `${this.name}: ${this.message}`;
    }
}

export class GenericUnleashError extends UnleashError {
    constructor({
        name,
        message,
    }: {
        name: UnleashApiErrorName;
        message: string;
    }) {
        super(message, name);
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

export type ApiErrorSchema = FromSchema<typeof apiErrorSchema>;
