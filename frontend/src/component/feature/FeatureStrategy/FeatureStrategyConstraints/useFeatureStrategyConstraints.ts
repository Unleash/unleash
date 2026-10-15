import type { IConstraint, StrategyFormState } from 'interfaces/strategy';
import type React from 'react';
import { useEffect } from 'react';

const filterConstraints = (constraint: any) => {
    if (
        constraint.hasOwnProperty('values') &&
        (!constraint.hasOwnProperty('value') || constraint.value === '')
    ) {
        return constraint.values && constraint.values.length > 0;
    }

    if (constraint.hasOwnProperty('value')) {
        return constraint.value !== '';
    }
};

export const useFeatureStrategyConstraints = <T extends StrategyFormState>(
    strategy: T,
    setStrategy: React.Dispatch<React.SetStateAction<T>>,
): [IConstraint[], React.Dispatch<React.SetStateAction<IConstraint[]>>] => {
    useEffect(() => {
        return () => {
            // If the component is unmounting we want to remove all constraints that do not have valid single value or
            // valid multivalues
            setStrategy((prev: T) => {
                if (!prev.constraints) return prev;
                return {
                    ...prev,
                    constraints: prev.constraints.filter(filterConstraints),
                };
            });
        };
    }, [setStrategy]);

    const setConstraints = (value: React.SetStateAction<IConstraint[]>) => {
        setStrategy((prev: T) => ({
            ...prev,
            constraints:
                value instanceof Function
                    ? value(prev.constraints || [])
                    : value,
        }));
    };

    return [strategy.constraints || [], setConstraints];
};
