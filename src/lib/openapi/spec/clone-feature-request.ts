import { OpenAPIV3 } from 'openapi-types';
import { cloneFeatureSchema } from './clone-feature-schema';

export const cloneFeatureRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: cloneFeatureSchema,
        },
    },
};
