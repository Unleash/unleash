import { OpenAPIV3 } from 'openapi-types';
import { featureToggleDtoSchema } from './feature-toggle-dto-schema';

export const updateFeatureRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: featureToggleDtoSchema,
        },
    },
};
