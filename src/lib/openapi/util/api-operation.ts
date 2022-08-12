import { OpenAPIV3 } from 'openapi-types';
import { OpenApiTag } from './openapi-tags';

export interface ApiOperation<Tag = OpenApiTag>
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    operationId: string;
    tags: [Tag];
}
