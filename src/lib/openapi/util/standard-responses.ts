export const emptyResponse = {
    description: 'emptyResponse',
};

export const unauthorizedResponse = {
    description:
        'Authorization information is missing or invalid. Provide a valid API token as the `authorization` header, e.g. `authorization:*.*.my-admin-token`.',
} as const;

export const badRequestResponse = {
    description: 'The request data do not match what we expect.',
} as const;

const standardResponses = {
    400: badRequestResponse,
    401: unauthorizedResponse,
} as const;

type StandardResponses = typeof standardResponses;

export const getStandardResponses = (
    ...statusCodes: (keyof StandardResponses)[]
): Partial<StandardResponses> =>
    statusCodes.reduce(
        (acc, n) => ({
            ...acc,
            [n]: standardResponses[n],
        }),
        {} as Partial<StandardResponses>,
    );
