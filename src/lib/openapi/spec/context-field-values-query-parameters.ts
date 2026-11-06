import type { FromQueryParams } from '../util/from-query-params.js';

export const contextFieldValuesQueryParameters = [
    {
        name: 'project',
        schema: {
            type: 'string',
            example: 'default',
        },
        description:
            'The project to return context field values for. Only constraints used by flags in this project are considered.',
        required: true,
        in: 'query',
    },
] as const;

export type ContextFieldValuesQueryParameters = FromQueryParams<
    typeof contextFieldValuesQueryParameters
>;
