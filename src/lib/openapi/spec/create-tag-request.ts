import { OpenAPIV3 } from 'openapi-types';
import { tagSchema } from './tag-schema';

export const createTagRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: tagSchema,
        },
    },
};
