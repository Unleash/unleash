export const emptyResponse = {
    description: 'This response has no body.',
} as const;

const unauthorizedResponse = {
    description:
        'Authorization information is missing or invalid. Provide a valid API token as the `authorization` header, e.g. `authorization:*.*.my-admin-token`.',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '9c40958a-daac-400e-98fb-3bb438567008',
                        description: 'The ID of the error instance',
                    },
                    name: {
                        type: 'string',
                        example: 'AuthenticationRequired',
                        description: 'The name of the error kind',
                    },
                    message: {
                        type: 'string',
                        example:
                            'You must log in to use Unleash. Your request had no authorization header, so we could not authorize you. Try logging in at /auth/simple/login.',
                        description: 'A description of what went wrong.',
                    },
                },
            },
        },
    },
} as const;

const forbiddenResponse = {
    description:
        'User credentials are valid but does not have enough privileges to execute this operation',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '9c40958a-daac-400e-98fb-3bb438567008',
                        description: 'The ID of the error instance',
                    },
                    name: {
                        type: 'string',
                        example: 'NoAccessError',
                        description: 'The name of the error kind',
                    },
                    message: {
                        type: 'string',
                        example:
                            'You need the "UPDATE_ADDON" permission to perform this action in the "development" environment.',
                        description: 'A description of what went wrong.',
                    },
                },
            },
        },
    },
} as const;

const badRequestResponse = {
    description: 'The request data does not match what we expect.',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '9c40958a-daac-400e-98fb-3bb438567008',
                        description: 'The ID of the error instance',
                    },
                    name: {
                        type: 'string',
                        example: 'ValidationError',
                        description: 'The name of the error kind',
                    },
                    message: {
                        type: 'string',
                        example: `The request payload you provided doesn't conform to the schema. The .parameters property should be object. You sent [].`,
                        description: 'A description of what went wrong.',
                    },
                },
            },
        },
    },
} as const;

const notFoundResponse = {
    description: 'The requested resource was not found.',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '9c40958a-daac-400e-98fb-3bb438567008',
                        description: 'The ID of the error instance',
                    },
                    name: {
                        type: 'string',
                        example: 'NotFoundError',
                        description: 'The name of the error kind',
                    },
                    message: {
                        type: 'string',
                        example: `Could not find the addon with ID "12345".`,
                        description: 'A description of what went wrong.',
                    },
                },
            },
        },
    },
} as const;

const conflictResponse = {
    description:
        'The provided resource can not be created or updated because it would conflict with the current state of the resource or with an already existing resource, respectively.',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '9c40958a-daac-400e-98fb-3bb438567008',
                        description: 'The ID of the error instance',
                    },
                    name: {
                        type: 'string',
                        example: 'NameExistsError',
                        description: 'The name of the error kind',
                    },
                    message: {
                        type: 'string',
                        example:
                            'There is already a feature called "my-awesome-feature".',
                        description: 'A description of what went wrong.',
                    },
                },
            },
        },
    },
} as const;

const contentTooLargeResponse = {
    description:
        'The request body is larger than what we accept. By default we only accept bodies of 100kB or less',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '9c40958a-daac-400e-98fb-3bb438567008',
                        description: 'The ID of the error instance',
                    },
                    name: {
                        type: 'string',
                        example: 'ContentTooLarge',
                        description: 'The name of the error kind',
                    },
                    message: {
                        type: 'string',
                        example:
                            'You provided more data than we can handle. Unleash accepts at most X MB.',
                        description: 'A description of what went wrong.',
                    },
                },
            },
        },
    },
} as const;

const unsupportedMediaTypeResponse = {
    description: `The operation does not support request payloads of the provided type. Please ensure that you're using one of the listed payload types and that you have specified the right content type in the "content-type" header.`,
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '9c40958a-daac-400e-98fb-3bb438567008',
                        description: 'The ID of the error instance',
                    },
                    name: {
                        type: 'string',
                        example: 'ContentTypeerror',
                        description: 'The name of the error kind',
                    },
                    message: {
                        type: 'string',
                        example:
                            'We do not accept the content-type you provided (application/xml). Try using one of the content-types we do accept instead (application/json) and make sure the body is in the corresponding format.',
                        description: 'A description of what went wrong.',
                    },
                },
            },
        },
    },
} as const;

const standardResponses = {
    400: badRequestResponse,
    401: unauthorizedResponse,
    403: forbiddenResponse,
    404: notFoundResponse,
    409: conflictResponse,
    413: contentTooLargeResponse,
    415: unsupportedMediaTypeResponse,
} as const;

type StandardResponses = typeof standardResponses;

export const getStandardResponses = (
    ...statusCodes: (keyof StandardResponses)[]
): Partial<StandardResponses> =>
    statusCodes.reduce(
        (acc, statusCode) => ({
            ...acc,
            [statusCode]: standardResponses[statusCode],
        }),
        {} as Partial<StandardResponses>,
    );
