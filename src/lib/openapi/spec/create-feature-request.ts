import { OpenAPIV3 } from 'openapi-types';
import { createFeatureSchema } from './create-feature-schema';

export const createFeatureRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: createFeatureSchema,
        },
    },
};
