import { IConstraint } from 'interfaces/strategy';
import { useMemo } from 'react';

export const useSegmentValuesCount = (constraints: IConstraint[]): number => {
    return useMemo(() => {
        return constraints
            .map(constraint => constraint.values)
            .reduce((acc, values) => acc + (values?.length ?? 0), 0);
    }, [constraints]);
};
