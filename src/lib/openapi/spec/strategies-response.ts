import { OpenAPIV3 } from 'openapi-types';
import { strategiesSchema } from './strategies-schema';

export const strategiesResponse: OpenAPIV3.ResponseObject = {
    description: 'strategiesResponse',
    content: {
        'application/json': {
            schema: strategiesSchema,
        },
    },
};
