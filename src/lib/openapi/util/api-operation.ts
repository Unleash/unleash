import type { OpenAPIV3 } from 'openapi-types';
import type { OpenApiTag } from './openapi-tags.js';

export interface ApiOperation<Tag = OpenApiTag>
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    operationId: string;
    tags: [Tag];
    beta?: boolean;
    enterpriseOnly?: boolean;
}
