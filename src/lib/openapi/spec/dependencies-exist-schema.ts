import type { FromSchema } from 'json-schema-to-ts';

export const dependenciesExistSchema = {
    $id: '#/components/schemas/dependenciesExistSchema',
    type: 'boolean',
    description:
        '`true` when any dependencies exist, `false` when no dependencies exist.',
    components: {},
} as const;

export type DependenciesExistSchema = FromSchema<
    typeof dependenciesExistSchema
>;
