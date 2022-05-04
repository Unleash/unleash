import { OpenAPIV3 } from 'openapi-types';
import { createStrategySchema } from './create-strategy-schema';

export const createStrategyRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: createStrategySchema,
        },
    },
};
