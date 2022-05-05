import { OpenAPIV3 } from 'openapi-types';

export const featuresResponse: OpenAPIV3.ResponseObject = {
    description: 'featuresResponse',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/featuresSchema',
            },
        },
    },
};
