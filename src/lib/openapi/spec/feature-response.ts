import { OpenAPIV3 } from 'openapi-types';
import { featureSchema } from './feature-schema';

export const featureResponse: OpenAPIV3.ResponseObject = {
    description: 'featureResponse',
    content: {
        'application/json': {
            schema: featureSchema,
        },
    },
};
