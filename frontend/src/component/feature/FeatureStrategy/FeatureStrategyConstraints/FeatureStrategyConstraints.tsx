import type { IConstraint, IFeatureStrategy } from 'interfaces/strategy';
import type React from 'react';
import { useEffect } from 'react';
import {
    UPDATE_FEATURE_STRATEGY,
    CREATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { useHasProjectEnvironmentAccess } from 'hooks/useHasAccess';
import { FeatureStrategyConstraintAccordionList } from './FeatureStrategyConstraintAccordionList/FeatureStrategyConstraintAccordionList.tsx';

interface IFeatureStrategyConstraintsProps {
    projectId: string;
    environmentId: string;
    strategy: Partial<IFeatureStrategy>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
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

export const FeatureStrategyConstraints = ({
    projectId,
    environmentId,
    strategy,
    setStrategy,
}: IFeatureStrategyConstraintsProps) => {
    useEffect(() => {
        return () => {
            if (!strategy.constraints) {
                return;
            }

            // If the component is unmounting we want to remove all constraints that do not have valid single value or
            // valid multivalues
            setStrategy((prev) => ({
                ...prev,
                constraints: prev.constraints?.filter(filterConstraints),
            }));
        };
    }, []);

    const constraints = strategy.constraints || [];

    const setConstraints = (value: React.SetStateAction<IConstraint[]>) => {
        setStrategy((prev) => {
            return {
                ...prev,
                constraints:
                    value instanceof Function
                        ? value(prev.constraints || [])
                        : value,
            };
        });
    };

    const showCreateButton = useHasProjectEnvironmentAccess(
        CREATE_FEATURE_STRATEGY,
        projectId,
        environmentId,
    );

    const allowEditAndDelete = useHasProjectEnvironmentAccess(
        UPDATE_FEATURE_STRATEGY,
        projectId,
        environmentId,
    );

    return (
        <FeatureStrategyConstraintAccordionList
            constraints={constraints}
            setConstraints={allowEditAndDelete ? setConstraints : undefined}
            showCreateButton={showCreateButton}
        />
    );
};
