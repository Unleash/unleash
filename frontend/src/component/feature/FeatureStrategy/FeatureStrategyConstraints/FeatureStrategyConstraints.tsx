import type { IConstraint, IStrategyFormState } from 'interfaces/strategy';
import type React from 'react';
import { useEffect } from 'react';
import { FeatureStrategyConstraintAccordionList } from './FeatureStrategyConstraintAccordionList/FeatureStrategyConstraintAccordionList.tsx';

interface IFeatureStrategyConstraintsProps<
    T extends IStrategyFormState = IStrategyFormState,
> {
    strategy: T;
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    permissions?: {
        create: boolean;
        edit: boolean;
    };
}

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

export const FeatureStrategyConstraints = <
    T extends IStrategyFormState = IStrategyFormState,
>({
    strategy,
    setStrategy,
    permissions = { create: true, edit: true },
}: IFeatureStrategyConstraintsProps<T>) => {
    useEffect(() => {
        return () => {
            if (!strategy.constraints) {
                return;
            }

            // If the component is unmounting we want to remove all constraints that do not have valid single value or
            // valid multivalues
            setStrategy((prev: T) => ({
                ...prev,
                constraints: prev.constraints?.filter(filterConstraints),
            }));
        };
    }, []);

    const constraints = strategy.constraints || [];

    const setConstraints = (value: React.SetStateAction<IConstraint[]>) => {
        setStrategy((prev: T) => ({
            ...prev,
            constraints:
                value instanceof Function
                    ? value(prev.constraints || [])
                    : value,
        }));
    };

    return (
        <FeatureStrategyConstraintAccordionList
            constraints={constraints}
            setConstraints={permissions.edit ? setConstraints : undefined}
            showCreateButton={permissions.create}
        />
    );
};
