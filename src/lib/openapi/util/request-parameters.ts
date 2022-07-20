import { OpenAPIV3 } from 'openapi-types';

// type ParameterDetails = {
//     description: string;
// } & (
//     | { type: 'boolean'; default?: boolean; enum?: boolean[] }
//     | { type: 'string'; default?: string; enum?: string[] }
//     | { type: 'number'; default?: number; enum?: number[] }
// );

// { [parameterName: string]: Parameter };
// type Parameters = Record<ParameterName, ParameterDetails>;

type ParameterName = string;
type Description = string;

export const createRequestParameters = (
    params: Record<ParameterName, Description>,
): OpenAPIV3.ParameterObject[] =>
    Object.entries(params).map(([name, description]) => ({
        name,
        description,
        schema: { type: 'string' },
        in: 'query',
    }));
