import { OpenAPIV3 } from 'openapi-types';
import { updateFeatureSchema } from './updateFeatureSchema';

export const updateFeatureRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: updateFeatureSchema,
        },
    },
};
