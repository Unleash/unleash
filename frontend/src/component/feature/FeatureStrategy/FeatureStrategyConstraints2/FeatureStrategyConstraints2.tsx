import { IFeatureStrategy, IConstraint } from 'interfaces/strategy';
import React from 'react';
import { ConstraintAccordion } from 'component/common/ConstraintAccordion/ConstraintAccordion';
import produce from 'immer';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    CREATE_FEATURE_STRATEGY,
    UPDATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { createEmptyConstraint } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints2/createEmptyConstraint';
import { useWeakMap } from 'hooks/useWeakMap';

interface IFeatureStrategyConstraints2Props {
    projectId: string;
    environmentId: string;
    strategy: Partial<IFeatureStrategy>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
}

// Extra form state for each constraint.
interface IConstraintFormState {
    // Is the constraint currently being edited?
    editing?: boolean;
    // Is the constraint new (not yet saved)?
    unsaved?: boolean;
}

export const FeatureStrategyConstraints2 = ({
    projectId,
    environmentId,
    strategy,
    setStrategy,
}: IFeatureStrategyConstraints2Props) => {
    const state = useWeakMap<IConstraint, IConstraintFormState>();
    const { context } = useUnleashContext();
    const { constraints = [] } = strategy;

    const onEdit = (constraint: IConstraint) => {
        state.set(constraint, { editing: true });
    };

    const onAdd = () => {
        const constraint = createEmptyConstraint(context);
        state.set(constraint, { editing: true, unsaved: true });
        setStrategy(
            produce(draft => {
                draft.constraints = draft.constraints ?? [];
                draft.constraints.push(constraint);
            })
        );
    };

    const onCancel = (index: number) => {
        const constraint = constraints[index];
        state.get(constraint)?.unsaved && onRemove(index);
        state.set(constraint, {});
    };

    const onRemove = (index: number) => {
        const constraint = constraints[index];
        state.set(constraint, {});
        setStrategy(
            produce(draft => {
                draft.constraints?.splice(index, 1);
            })
        );
    };

    const onSave = (index: number, constraint: IConstraint) => {
        state.set(constraint, {});
        setStrategy(
            produce(draft => {
                draft.constraints = draft.constraints ?? [];
                draft.constraints[index] = constraint;
            })
        );
    };

    return (
        <>
            {strategy.constraints?.map((constraint, index) => (
                <ConstraintAccordion
                    key={index}
                    environmentId={environmentId}
                    constraint={constraint}
                    onEdit={onEdit.bind(null, constraint)}
                    onCancel={onCancel.bind(null, index, constraint)}
                    onDelete={onRemove.bind(null, index, constraint)}
                    onSave={onSave.bind(null, index)}
                    editing={Boolean(state.get(constraint)?.editing)}
                    compact
                />
            ))}
            <PermissionButton
                type="button"
                onClick={onAdd}
                variant="text"
                permission={[UPDATE_FEATURE_STRATEGY, CREATE_FEATURE_STRATEGY]}
                environmentId={environmentId}
                projectId={projectId}
            >
                Add constraints
            </PermissionButton>
        </>
    );
};
