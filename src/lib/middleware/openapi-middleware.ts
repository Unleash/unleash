import * as OpenApiValidator from 'express-openapi-validator';
import { Request, RequestHandler } from 'express';
import { InternalServerError } from 'express-openapi-validator/dist/framework/types';

export const OPEN_API_DOCS = 'docs/openapi';
export const OPEN_API_DOCS_ADMIN = `${OPEN_API_DOCS}/admin.yaml`;

// Print an invalid response to the console for debugging.
const printBadResponse = (
    error: InternalServerError,
    body: unknown,
    req: Request,
): void => {
    console.debug(req.originalUrl);
    console.debug(error);
    console.debug(body);
    throw error;
};

// Validate requests and responses with an OpenAPI spec.
const createOpenApiValidation = (apiSpec: string): RequestHandler[] => {
    const isDevelopment = process.env.NODE_ENV === 'development';

    return OpenApiValidator.middleware({
        apiSpec,
        validateApiSpec: true,
        validateRequests: true,
        validateResponses: isDevelopment && { onError: printBadResponse },
    });
};

// Validate requests and responses with the Admin API spec.
// Response validation is only enabled in development mode.
export const createOpenApiAdminValidation = (): RequestHandler[] => {
    return createOpenApiValidation(OPEN_API_DOCS_ADMIN);
};
