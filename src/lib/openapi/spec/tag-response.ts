import { OpenAPIV3 } from 'openapi-types';
import { tagSchema } from './tag-schema';

export const tagResponse: OpenAPIV3.ResponseObject = {
    description: 'tagResponse',
    content: {
        'application/json': {
            schema: tagSchema,
        },
    },
};
