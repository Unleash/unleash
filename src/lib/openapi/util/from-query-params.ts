// module to create typescript types from query param lists. Based on
// input in this GitHub issue:
// https://github.com/ThomasAribart/json-schema-to-ts/issues/82
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

import { O, L } from 'ts-toolbelt';

type OpenApiParam = {
    readonly name: string;
    readonly schema: JSONSchema;
    // Parameter types:
    // https://swagger.io/docs/specification/describing-parameters/#types
    readonly in: 'query' | 'path' | 'header' | 'cookie';
};

type RecurseOnParams<
    P extends readonly OpenApiParam[],
    R extends O.Object = {},
> = {
    continue: RecurseOnParams<
        L.Tail<P>,
        L.Head<P>['in'] extends 'query'
            ? O.Merge<
                  R,
                  {
                      [key in L.Head<P>['name']]: FromSchema<
                          L.Head<P>['schema']
                      >;
                  }
              >
            : R
    >;
    stop: R;
}[P extends readonly [OpenApiParam, ...OpenApiParam[]] ? 'continue' : 'stop'];

export type FromQueryParams<P extends readonly OpenApiParam[]> =
    RecurseOnParams<P>;
