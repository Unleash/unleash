import { v4 as uuidV4 } from 'uuid';
import { FromSchema } from 'json-schema-to-ts';

// const UnleashApiErrorTypes = {
//     ValidationError: 400,
//     BadDataError: 400,
//     BadRequestError: 400,
//     OwaspValidationError: 400,
//     PasswordUndefinedError: 400,
//     MinimumOneEnvironmentError: 400,
//     InvalidTokenError: 401,
//     NoAccessError: 403,
//     UsedTokenError: 403,
//     InvalidOperationError: 403,
//     IncompatibleProjectError: 403,
//     OperationDeniedError: 403,
//     NotFoundError: 404,
//     NameExistsError: 409,
//     FeatureHasTagError: 409,
//     RoleInUseError: 400,
//     ProjectWithoutOwnerError: 409,
//     TypeError: 400,
//     UnknownError: 400,
//     // server errors; not the end user's fault
//     InternalError: 500,
// } as const;

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
    // server errors; not the end user's fault
    'InternalError',
] as const;

type UnleashApiErrorKind = typeof UnleashApiErrorTypes[number];

const statusCode = (errorKind: UnleashApiErrorKind) => {};

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

export const fromLegacyError = (e: Error): ApiErrorSchema => {
    const type = UnleashApiErrorTypes.includes(e.name as UnleashApiErrorKind)
        ? (e.name as UnleashApiErrorKind)
        : 'UnknownError';

    return new UnleashError({
        type,
        message: e.message,
        suggestion: 'Tell Unleash about this suggestion being missing',
    }).serialize();
};

export type ApiErrorSchema = FromSchema<typeof apiErrorSchema>;
