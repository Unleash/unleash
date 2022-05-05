import { OpenAPIV3 } from 'openapi-types';

export const featureEnvironmentInfoResponse: OpenAPIV3.ResponseObject = {
    description: 'featureEnvironmentInfoResponse',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/featureEnvironmentInfoSchema',
            },
        },
    },
};
