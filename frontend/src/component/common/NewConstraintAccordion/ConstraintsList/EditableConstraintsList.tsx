import { forwardRef } from 'react';
import { styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import produce from 'immer';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { useWeakMap } from 'hooks/useWeakMap';
import { constraintId } from 'component/common/LegacyConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';
import { EditableConstraintWrapper } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraintWrapper';
import type {
    IConstraintsListProps as IEditableConstraintsListProps,
    IConstraintsListRef as IEditableConstraintsListRef,
    IConstraintsListItemState as IEditableConstraintsListItemState,
} from './ConstraintsListUtils';
import { useConstraintsList } from './ConstraintsListUtils';

export type { IEditableConstraintsListProps, IEditableConstraintsListRef };

export const editableConstraintsListId = 'editableConstraintsListId';

export const useEditableConstraintsList = useConstraintsList;

const StyledContainer = styled('div')({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
});

export const EditableConstraintsList = forwardRef<
    IEditableConstraintsListRef | undefined,
    IEditableConstraintsListProps
>(({ constraints, setConstraints }, ref) => {
    const { context } = useUnleashContext();
    const state = useWeakMap<IConstraint, IEditableConstraintsListItemState>();

    const onRemove =
        setConstraints &&
        ((index: number) => {
            const constraint = constraints[index];
            state.set(constraint, {});
            setConstraints(
                produce((draft) => {
                    draft.splice(index, 1);
                }),
            );
        });

    const onSave =
        setConstraints &&
        ((index: number, constraint: IConstraint) => {
            state.set(constraint, {});
            setConstraints(
                produce((draft) => {
                    draft[index] = constraint;
                }),
            );
        });

    const onAutoSave =
        setConstraints &&
        ((id: string | undefined) => (constraint: IConstraint) => {
            state.set(constraint, { editing: true });
            setConstraints(
                produce((draft) => {
                    return draft.map((oldConstraint) => {
                        if (oldConstraint[constraintId] === id) {
                            return constraint;
                        }
                        return oldConstraint;
                    });
                }),
            );
        });

    const onCancel = (index: number) => {
        const constraint = constraints[index];
        state.get(constraint)?.new && onRemove?.(index);
        state.set(constraint, {});
    };

    if (context.length === 0) {
        return null;
    }

    return (
        <StyledContainer id={editableConstraintsListId}>
            <ConstraintsList>
                {constraints.map((constraint, index) => (
                    <EditableConstraintWrapper
                        key={constraint[constraintId]}
                        constraint={constraint}
                        onCancel={onCancel?.bind(null, index)}
                        onDelete={onRemove?.bind(null, index)}
                        onSave={onSave!.bind(null, index)}
                        onAutoSave={onAutoSave?.(constraint[constraintId])}
                    />
                ))}
            </ConstraintsList>
        </StyledContainer>
    );
});
