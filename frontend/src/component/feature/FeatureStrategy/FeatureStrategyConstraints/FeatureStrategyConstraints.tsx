import { IConstraint, IFeatureStrategy } from 'interfaces/strategy';
import React, { useMemo } from 'react';
import { ConstraintAccordionList } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';

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
        setStrategy(prev => ({
            ...prev,
            constraints: value instanceof Function ? value(constraints) : value,
        }));
    };

    return (
        <ConstraintAccordionList
            projectId={projectId}
            environmentId={environmentId}
            constraints={constraints}
            setConstraints={setConstraints}
            showCreateButton
        />
    );
};
