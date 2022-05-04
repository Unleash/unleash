import { OpenAPIV3 } from 'openapi-types';
import { featuresSchema } from './features-schema';

export const featuresResponse: OpenAPIV3.ResponseObject = {
    description: 'featuresResponse',
    content: {
        'application/json': {
            schema: featuresSchema,
        },
    },
};
