import { OpenAPIV3 } from 'openapi-types';
import { updateStrategySchema } from './update-strategy-schema';

export const updateStrategyRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: updateStrategySchema,
        },
    },
};
