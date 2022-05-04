import { OpenAPIV3 } from 'openapi-types';
import { featureEnvironmentInfoSchema } from './feature-environment-info-schema';

export const featureEnvironmentInfoResponse: OpenAPIV3.ResponseObject = {
    description: 'featureEnvironmentInfoResponse',
    content: {
        'application/json': {
            schema: featureEnvironmentInfoSchema,
        },
    },
};
