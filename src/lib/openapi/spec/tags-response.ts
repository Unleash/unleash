import { OpenAPIV3 } from 'openapi-types';
import { tagsSchema } from './tags-schema';

export const tagsResponse: OpenAPIV3.ResponseObject = {
    description: 'tagsResponse',
    content: {
        'application/json': {
            schema: tagsSchema,
        },
    },
};
