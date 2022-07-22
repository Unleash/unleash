import { SchemaObject } from 'ajv';
import fc, { Arbitrary } from 'fast-check';
import { OpenAPIV3 } from 'openapi-types';
import { urlFriendlyString } from '../../../test/arbitraries.test';
import {
    createRequestParameters,
    ParameterDetails,
    Parameters,
    ParameterType,
    toParamObject,
} from './request-parameters';

const paramName = urlFriendlyString;

const paramDesc = <T>(
    typeName: ParameterType,
    arb: Arbitrary<T>,
): Arbitrary<ParameterDetails<T>> =>
    fc.record(
        {
            type: fc.constant(typeName),
            description: fc.string(),
            default: arb,
            enum: fc.array(arb, { minLength: 1 }) as Arbitrary<[T, ...T[]]>,
            example: arb,
        },
        { requiredKeys: ['type', 'description'] },
    );

const parameterDescription = (): Arbitrary<ParameterDetails<any>> =>
    fc.oneof(
        paramDesc('boolean', fc.boolean()),
        paramDesc('string', fc.string()),
        paramDesc('number', fc.integer()),
    );

const parameterDetails = (): Arbitrary<Parameters> =>
    fc.dictionary(paramName(), parameterDescription());

describe('request parameter utils', () => {
    const parameterDetailsAreMappedCorrectly = (
        parameterDetailsObject: ParameterDetails<unknown>,
        parameterObject: OpenAPIV3.ParameterObject,
    ) => {
        const schema: SchemaObject = parameterObject.schema;

        return (
            schema.type === parameterDetailsObject.type &&
            parameterObject.description ===
                parameterDetailsObject.description &&
            parameterObject.example === parameterDetailsObject.example &&
            schema.enum === parameterDetailsObject.enum &&
            schema.default === parameterDetailsObject.default &&
            parameterObject.required === parameterDetailsObject.required
        );
    };

    it('turns a name and a parameter details description into a parameter object', () => {
        fc.assert(
            fc.property(
                paramName(),
                parameterDescription(),
                fc.context(),
                (name, details, ctx) => {
                    const result = toParamObject(name, details);

                    ctx.log(JSON.stringify(result));

                    return (
                        result.name === name &&
                        parameterDetailsAreMappedCorrectly(details, result)
                    );
                },
            ),
        );
    });

    it('turns an object of names and descriptions into a an expected parameter list', () => {
        fc.assert(
            fc.property(parameterDetails(), fc.context(), (parameters, ctx) => {
                const result = createRequestParameters(parameters);

                ctx.log(JSON.stringify(result));

                return result.every((paramsObject) =>
                    parameterDetailsAreMappedCorrectly(
                        parameters[paramsObject.name],
                        paramsObject,
                    ),
                );
            }),
        );
    });
});
