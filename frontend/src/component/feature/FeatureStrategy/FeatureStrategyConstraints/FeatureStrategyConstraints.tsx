import { IConstraint, IFeatureStrategy } from 'interfaces/strategy';
import React, { useMemo, useContext } from 'react';
import { ConstraintAccordionList } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import AccessContext from 'contexts/AccessContext';
import {
    UPDATE_FEATURE_STRATEGY,
    CREATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';

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
    const { hasAccess } = useContext(AccessContext);

    const constraints = useMemo(() => {
        return strategy.constraints ?? [];
    }, [strategy]);

    const setConstraints = (value: React.SetStateAction<IConstraint[]>) => {
        setStrategy(prev => ({
            ...prev,
            constraints: value instanceof Function ? value(constraints) : value,
        }));
    };

    const showCreateButton = hasAccess(
        CREATE_FEATURE_STRATEGY,
        projectId,
        environmentId
    );

    const allowEditAndDelete = hasAccess(
        UPDATE_FEATURE_STRATEGY,
        projectId,
        environmentId
    );

    return (
        <ConstraintAccordionList
            constraints={constraints}
            setConstraints={allowEditAndDelete ? setConstraints : undefined}
            showCreateButton={showCreateButton}
        />
    );
};
