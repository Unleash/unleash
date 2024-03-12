import { useRef } from 'react';
import type { CreateFeatureStrategySchema } from 'openapi';
/**
 * Don't revalidate if array content didn't change.
 * Needed for `columns` memo optimization.
 */

export type ProjectEnvironmentType = {
    environment: string;
    defaultStrategy?: CreateFeatureStrategySchema;
};
export const useEnvironmentsRef = (
    environments: Array<ProjectEnvironmentType> = [],
): string[] => {
    const names = environments.map(
        (env) => (env as ProjectEnvironmentType).environment,
    );
    const ref = useRef<Array<string>>(names);
    if (names.join('') !== ref.current?.join('')) {
        ref.current = names;
    }

    return ref.current;
};
