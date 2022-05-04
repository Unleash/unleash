import { OpenAPIV3 } from 'openapi-types';
import { strategySchema } from './strategy-schema';

export const strategyResponse: OpenAPIV3.ResponseObject = {
    description: 'strategyResponse',
    content: {
        'application/json': {
            schema: strategySchema,
        },
    },
};
