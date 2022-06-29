import { OpenAPIV3 } from 'openapi-types';

export const unauthorizedResponse: OpenAPIV3.ResponseObject = {
    description:
        'Authorization information is missing or invalid. Provide a valid API token as the `authorization` header, e.g. `authorization:*.*.my-admin-token`.',
} as const;

const standardResponses = {
    401: unauthorizedResponse,
} as const;

type StandardResponses = typeof standardResponses;

export const getStandardResponses = <K extends keyof StandardResponses>(
    ...statusCodes: K[]
): OpenAPIV3.ResponsesObject =>
    statusCodes.reduce(
        (acc, n) => ({
            ...acc,
            [n]: standardResponses[String(n)] as OpenAPIV3.ResponseObject,
        }),
        {},
    );
