import { OpenAPIV3 } from 'openapi-types';
import { OpenApiTag } from './openapi-tags';

type DeprecatedOpenAPITag = 'client' | 'other' | 'auth' | 'admin';

export interface ApiOperation<Tag = OpenApiTag | DeprecatedOpenAPITag>
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    operationId: string;
    tags: [Tag];
}
