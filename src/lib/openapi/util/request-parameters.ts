import { OpenAPIV3 } from 'openapi-types';

export type ParameterDescription<TypeName, T> = {
    type: TypeName;
    default?: T;
    enum?: T[];
};

export type ParameterDetails = {
    description: string;
} & (
    | ParameterDescription<'boolean', boolean>
    | ParameterDescription<'string', string>
    | ParameterDescription<'number', number>
);

export type Parameters = Record<ParameterName, ParameterDetails>;

type ParameterName = string;

export const createRequestParameters = (
    params: Parameters,
): OpenAPIV3.ParameterObject[] =>
    Object.entries(params).map(([name, deets]) => ({
        name,
        description: deets.description,
        schema: { type: 'string' },
        in: 'query',
    }));
