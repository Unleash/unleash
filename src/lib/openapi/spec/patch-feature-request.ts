import { OpenAPIV3 } from 'openapi-types';
import { patchFeatureRequestSchema } from './patch-feature-request-schema';

export const patchFeatureRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: patchFeatureRequestSchema,
        },
    },
};
