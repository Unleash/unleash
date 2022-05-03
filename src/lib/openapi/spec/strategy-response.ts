import { OpenAPIV3 } from 'openapi-types';

export const strategyResponse: OpenAPIV3.ResponseObject = {
    description: 'strategyResponse',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/strategySchema',
            },
        },
    },
};
