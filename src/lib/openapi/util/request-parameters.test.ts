import { SchemaObject } from 'ajv';
import fc, { Arbitrary } from 'fast-check';
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
    it('turns a name and a parameter details description into a parameter object', () => {
        fc.assert(
            fc.property(
                paramName(),
                parameterDescription(),
                (name, details) => {
                    const result = toParamObject(name, details);
                    const schema: SchemaObject = result.schema;

                    return (
                        result.name === name &&
                        schema.type === details.type &&
                        result.description === details.description &&
                        result.example === details.example &&
                        schema.enum === details.enum &&
                        schema.default === details.default
                    );
                },
            ),
        );
    });

    it('turns an object of names and descriptions into a an expected parameter list', () => {
        fc.assert(
            fc.property(parameterDetails(), fc.context(), (parameters, ctx) => {
                const result = createRequestParameters(parameters);

                ctx.log(JSON.stringify(parameters));
                ctx.log(JSON.stringify(result));

                return result.every(
                    (paramsObject) =>
                        paramsObject.description ===
                            parameters[paramsObject.name].description &&
                        (paramsObject.schema as SchemaObject).type ===
                            parameters[paramsObject.name].type,
                );
            }),
        );
    });
});
