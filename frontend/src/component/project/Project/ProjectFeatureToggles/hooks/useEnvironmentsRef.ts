import { useRef } from 'react';
import { CreateFeatureStrategySchema } from 'openapi';
/**
 * Don't revalidate if array content didn't change.
 * Needed for `columns` memo optimization.
 */

export type ProjectEnvironmentType = {
    environment: string;
    defaultStrategy: CreateFeatureStrategySchema | null;
};
export const useEnvironmentsRef = (
    environments: Array<string | ProjectEnvironmentType> = []
): string[] => {
    let names: string[];
    if (
        environments &&
        environments.length > 0 &&
        typeof environments[0] !== 'string'
    ) {
        names = environments.map(
            env => (env as ProjectEnvironmentType).environment
        );
    } else {
        names = environments as string[];
    }
    const ref = useRef<Array<string>>(names);
    if (names.join('') !== ref.current?.join('')) {
        ref.current = names;
    }

    return ref.current;
};
