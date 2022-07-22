import { SchemaObject } from 'ajv';
import fc, { Arbitrary } from 'fast-check';
import { urlFriendlyString } from '../../../test/arbitraries.test';
import {
    createQueryParameters,
    ParameterDetails,
    Parameters,
    ParameterType,
} from './query-parameters';

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
    it('turns an object of names and descriptions into a an expected parameter list', () => {
        fc.assert(
            fc.property(parameterDetails(), fc.context(), (parameters, ctx) => {
                const result = createQueryParameters(parameters);

                ctx.log(JSON.stringify(result));

                return result.every((paramsObject) => {
                    const parameterDetailsObject =
                        parameters[paramsObject.name];
                    const schema: SchemaObject = paramsObject.schema;

                    return (
                        schema.type === parameterDetailsObject.type &&
                        paramsObject.description ===
                            parameterDetailsObject.description &&
                        paramsObject.example ===
                            parameterDetailsObject.example &&
                        schema.enum === parameterDetailsObject.enum &&
                        schema.default === parameterDetailsObject.default &&
                        paramsObject.required ===
                            parameterDetailsObject.required
                    );
                });
            }),
        );
    });
});
