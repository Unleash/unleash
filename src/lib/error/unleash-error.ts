import type { FromSchema } from 'json-schema-to-ts';
import { randomId } from '../util/random-id.js';

export const UnleashApiErrorTypes = [
    'ContentTypeError',
    'ConflictError',
    'DisabledError',
    'FeatureHasTagError',
    'IncompatibleProjectError',
    'InvalidOperationError',
    'InvalidTokenError',
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
    'PermissionError',
    'InvalidTokenError',
    'OwaspValidationError',
    'ForbiddenError',
    'ExceedsLimitError',
    'PasswordPreviouslyUsedError',
    'RateLimitError',
    // server errors; not the end user's fault
    'InternalError',
] as const;

export type UnleashApiErrorName = (typeof UnleashApiErrorTypes)[number];

export abstract class UnleashError extends Error {
    id: string;

    name: string;

    abstract statusCode: number;

    additionalParameters: object;

    constructor(message: string, name?: string) {
        super();
        this.id = randomId();
        this.name = name || this.constructor.name;
        super.message = message;
    }

    help(): string {
        return `Get help for id ${this.id}`;
    }

    toJSON(): ApiErrorSchema {
        return {
            id: this.id,
            name: this.name,
            message: this.message,
            details: [{ message: this.message }],
        };
    }

    toString(): string {
        return `${this.name}: ${this.message}`;
    }
}

export class GenericUnleashError extends UnleashError {
    statusCode: number;

    constructor({
        name,
        message,
        statusCode,
    }: {
        name: UnleashApiErrorName;
        message: string;
        statusCode: number;
    }) {
        super(message, name);
        this.statusCode = statusCode;
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
