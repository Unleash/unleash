import { OpenAPIV3 } from 'openapi-types';
import { emptyResponseSchema } from './empty-response-schema';

export const emptyResponse: OpenAPIV3.ResponseObject = {
    description: 'emptyResponse',
    content: {
        'application/json': {
            schema: emptyResponseSchema,
        },
    },
};
