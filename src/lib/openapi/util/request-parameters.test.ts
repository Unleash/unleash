import { SchemaObject } from 'ajv';
import fc, { Arbitrary } from 'fast-check';
import {
    createRequestParameters,
    ParameterDescription,
    ParameterDetails,
    Parameters,
} from './request-parameters';

const paramDesc = <T, U>(
    typeName: U,
    gen: Arbitrary<T>,
): Arbitrary<ParameterDescription<U, T>> =>
    fc.record(
        {
            type: fc.constant(typeName),
            default: gen,
            enum: fc.array(gen, { minLength: 1 }),
        },
        { requiredKeys: ['type'] },
    );

const parameterDescription = (): Arbitrary<ParameterDescription<any, any>> =>
    fc.oneof(
        paramDesc('boolean', fc.boolean()),
        paramDesc('string', fc.string()),
        paramDesc('number', fc.integer()),
    );

const paramDetails = (): Arbitrary<ParameterDetails> =>
    fc
        .tuple(fc.string(), parameterDescription())
        .map(([description, deets]) => ({
            description,
            ...deets,
        }));

const parameterDetails = (): Arbitrary<Parameters> =>
    fc.dictionary(fc.string({ minLength: 1 }), paramDetails());

describe('request parameter utils', () => {
    it('turns an object of names and descriptions into a an expected parameter list', () => {
        fc.assert(
            fc.property(parameterDetails(), fc.context(), (parameters, ctx) => {
                const result = createRequestParameters(parameters);

                ctx.log(JSON.stringify(parameters));
                // ctx.log(JSON.stringify(result));
                return false;
                // return result.every((paramsObject) => {
                //     return false;
                // });
            }),
        );
    });

    // it('assigns parameter descriptions correctly', () => {
    //     fc.assert(fc.property());
    // });

    // it('says every parameter is of type string and goes in the query', () => {
    //     fc.assert(
    //         fc.property(
    //             fc.dictionary(fc.string({ minLength: 1 }), fc.string()),

    //             (parameters) => {
    //                 return createRequestParameters(parameters).every(
    //                     (paramsObject) =>
    //                         (paramsObject.schema as SchemaObject).type ===
    //                             'string' && paramsObject.in === 'query',
    //                 );
    //             },
    //         ),
    //     );
    // });
});
