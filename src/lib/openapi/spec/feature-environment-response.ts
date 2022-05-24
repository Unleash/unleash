import { OpenAPIV3 } from 'openapi-types';

export const featureEnvironmentResponse: OpenAPIV3.ResponseObject = {
    description: 'featureEnvironmentResponse',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/featureEnvironmentSchema',
            },
        },
    },
};
