import { v4 as uuidV4 } from 'uuid';
import { FromSchema } from 'json-schema-to-ts';

const UnleashApiErrorTypes = [
    'ValidationError',
    'BadDataError',
    'BadRequestError',
    'OwaspValidationError',
    'PasswordUndefinedError',
    'MinimumOneEnvironmentError',
    'InvalidTokenError',
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
    'PasswordMismatchError',
    'DisabledError',
    'ContentTypeError',

    // server errors; not the end user's fault
    'InternalError',
] as const;

type UnleashApiErrorKind = typeof UnleashApiErrorTypes[number];

export const statusCode = (errorKind: UnleashApiErrorKind): number => {
    switch (errorKind) {
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
            return 400;
        case 'InternalError':
            return 500;
        case 'PasswordMismatchError':
            return 401;
        case 'DisabledError':
            return 422;
    }
};

type UnleashErrorData = {
    type: UnleashApiErrorKind;
    message: string;
    suggestion: string;
    documentationLink?: string;
};

export class UnleashError implements Error {
    id: string;

    suggestion: string;

    name: UnleashApiErrorKind;

    message: string;

    documentationLink: string | null;

    constructor({
        type,
        message,
        suggestion,
        documentationLink,
    }: UnleashErrorData) {
        this.id = uuidV4();
        this.name = type;
        this.message = message;
        this.suggestion = suggestion;
        this.documentationLink = documentationLink ?? null;
    }

    help() {
        return `Get help for id ${this.id}`;
    }

    serialize(): ApiErrorSchema {
        return {
            id: this.id,
            type: this.name,
            message: this.message,
            suggestion: this.suggestion,
            documentationLink:
                this.documentationLink ||
                'There is no documentation link available for this or none was provided.',
            help: this.help(),
        };
    }

    toJSON() {
        return this.serialize();
    }
}

export const apiErrorSchema = {
    $id: '#/components/schemas/apiError',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'type', 'message', 'documentationLink'],
    description:
        'An Unleash API error. Contains information about what went wrong and suggests what you can do to fix your issue.',
    properties: {
        type: {
            type: 'string',
            enum: UnleashApiErrorTypes,
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
        documentationLink: {
            type: 'string',
            pattern: 'url',
            description:
                'A URL to where you can find more information about using this addon type.',
            example: 'https://docs.getunleash.io/docs/addons/slack',
        },
        message: {
            type: 'string',
            description: 'A human-readable explanation of what went wrong.',
            example:
                "We couldn't find an addon provider with the name that you are trying to add ('bogus-addon')",
        },
        suggestion: {
            type: 'string',
            description: 'Suggestions to fix what might have gone wrong.',
            example:
                "You need to use the name of an existing addon provider (such as 'slack' or 'webhook') as the `provider` property value",
        },
        help: {
            type: 'string',
            description: 'Where can you get more help?',
            example:
                'If you need help, you can ask a question on [GitHub discussions](https://github.com/orgs/Unleash/discussions) or on Slack (slack.unleash.run). Or ask your Unleash administrator to look up the error id 0b84c7fd-5278-4087-832d-0b502c7929b3.',
        },
    },
    components: {},
} as const;

const authErrorSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['path', 'name'],
    description: 'An API authorization error. Contains a path.',
    properties: {
        name: {
            type: 'string',
            enum: ['PasswordMismatchError'],
            example: 'PasswordMismatchError',
            description: 'The name of this authorization error type.',
        },
        path: {
            type: 'string',
            pattern: 'uri',
            example: '/auth/simple/login',
            description: 'Where you must go to log in.',
        },
    },
};

const validationErrorSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['errors', 'name'],
    description: 'An API authorization error. Contains a path.',
    properties: {
        name: {
            type: 'string',
            enum: ['ValidationError'],
            example: 'ValidationError',
            description: 'The name of this authorization error type.',
        },
        errors: {
            type: 'array',
            description:
                'A list of errors on the request body with description and suggestions.',
            example: [
                {
                    description: 'The x property is wrong.',
                    suggestion: 'Try doing it right.',
                },
            ],
            items: {
                type: 'object',
                required: ['description', 'suggestion'],
                properties: {
                    description: { type: 'string' },
                    suggestion: { type: 'string' },
                },
            },
            example: '/auth/simple/login',
            description: 'Where you must go to log in.',
        },
    },
};

export const fromLegacyError = (e: Error): UnleashError => {
    const type = UnleashApiErrorTypes.includes(e.name as UnleashApiErrorKind)
        ? (e.name as UnleashApiErrorKind)
        : 'UnknownError';

    return new UnleashError({
        type,
        message: e.message,
        suggestion: 'Tell Unleash about this suggestion being missing',
    });
};

export type ApiErrorSchema = FromSchema<typeof apiErrorSchema>;
