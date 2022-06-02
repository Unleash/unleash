import { OpenAPIV3 } from 'openapi-types';

export interface AdminApiOperation
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    tags: ['admin'];
}

export interface ClientApiOperation
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    tags: ['client'];
}
