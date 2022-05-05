import { OpenAPIV3 } from 'openapi-types';
import { patchStrategySchema } from './patch-strategy-schema';

export const patchStrategyRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: patchStrategySchema,
        },
    },
};
