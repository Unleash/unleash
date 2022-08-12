import { OpenAPIV3 } from 'openapi-types';

export interface ApiOperation<
    Tag = 'admin' | 'client' | 'frontend' | 'auth' | 'other',
> extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    operationId: string;
    tags: [Tag];
}
