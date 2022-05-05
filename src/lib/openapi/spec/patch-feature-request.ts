import { OpenAPIV3 } from 'openapi-types';
import { patchFeatureSchema } from './patch-feature-schema';

export const patchFeatureRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: patchFeatureSchema,
        },
    },
};
