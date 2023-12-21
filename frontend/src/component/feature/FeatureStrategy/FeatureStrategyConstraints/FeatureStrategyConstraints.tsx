import { IConstraint, IFeatureStrategy } from 'interfaces/strategy';
import React, { useMemo } from 'react';
import {
    UPDATE_FEATURE_STRATEGY,
    CREATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { useHasProjectEnvironmentAccess } from 'hooks/useHasAccess';
import { FeatureStrategyConstraintAccordionList } from './FeatureStrategyConstraintAccordionList/FeatureStrategyConstraintAccordionList';

interface IFeatureStrategyConstraintsProps {
    projectId: string;
    environmentId: string;
    strategy: Partial<IFeatureStrategy>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
}

export const FeatureStrategyConstraints = ({
    projectId,
    environmentId,
    strategy,
    setStrategy,
}: IFeatureStrategyConstraintsProps) => {
    const constraints = useMemo(() => {
        return strategy.constraints ?? [];
    }, [strategy]);

    const setConstraints = (value: React.SetStateAction<IConstraint[]>) => {
        setStrategy((prev) => ({
            ...prev,
            constraints: value instanceof Function ? value(constraints) : value,
        }));
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
