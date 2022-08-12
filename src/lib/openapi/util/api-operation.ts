import { OpenAPIV3 } from 'openapi-types';
import { OpenApiTag } from './openapi-tags';

type DeprecatedOpenAPITag =
    // Deprecated tag names. Please use a tag from the OpenAPITag type instead.
    //
    // These tag names were the original ones we used for OpenAPI, but they
    // turned out to be too generic and/or didn't match the new tag naming
    // schema. Because we require our operations to have one of a predefined set
    // of values, it would be breaking change to remove them completely.
    'client' | 'other' | 'auth' | 'admin';

export interface ApiOperation<Tag = OpenApiTag | DeprecatedOpenAPITag>
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    operationId: string;
    tags: [Tag];
}
