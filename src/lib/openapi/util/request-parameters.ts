import { OpenAPIV3 } from 'openapi-types';

export type ParameterType = OpenAPIV3.NonArraySchemaObjectType;

export type ParameterDetails<U> = {
    description: string;
    type: ParameterType;
    default?: U;
    enum?: [U, ...U[]];
    example?: U;
};

export type Parameters = {
    [parameterName: string]: ParameterDetails<unknown>;
};

export const toParamObject = (
    name: string,
    details: ParameterDetails<unknown>,
): OpenAPIV3.ParameterObject => ({
    name,
    example: details.example,
    description: details.description,
    schema: {
        type: details.type,
        enum: details.enum,
        default: details.default,
    },
    in: 'query',
});

export const createRequestParameters = (params: {
    [parameterName: string]: ParameterDetails<unknown>;
}): OpenAPIV3.ParameterObject[] =>
    Object.entries(params).map(([name, deets]) => toParamObject(name, deets));
