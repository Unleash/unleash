import { forwardRef } from 'react';
import { styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import produce from 'immer';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { useWeakMap } from 'hooks/useWeakMap';
import { constraintId } from 'component/common/LegacyConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';
import { ConstraintAccordionView } from 'component/common/NewConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';
import type {
    IConstraintsListProps as IViewableConstraintsListProps,
    IConstraintsListRef as IViewableConstraintsListRef,
    IConstraintsListItemState as IViewableConstraintsListItemState,
} from './ConstraintsListUtils';
import { useConstraintsList } from './ConstraintsListUtils';

export type { IViewableConstraintsListProps, IViewableConstraintsListRef };

export const viewableConstraintsListId = 'viewableConstraintsListId';

export const useViewableConstraintsList = useConstraintsList;

const StyledContainer = styled('div')({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
});

export const ViewableConstraintsList = forwardRef<
    IViewableConstraintsListRef | undefined,
    IViewableConstraintsListProps
>(({ constraints, setConstraints }, ref) => {
    const { context } = useUnleashContext();
    const state = useWeakMap<IConstraint, IViewableConstraintsListItemState>();

    const onEdit =
        setConstraints &&
        ((constraint: IConstraint) => {
            state.set(constraint, { editing: true });
        });

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

    if (context.length === 0) {
        return null;
    }

    return (
        <StyledContainer id={viewableConstraintsListId}>
            <ConstraintsList>
                {constraints.map((constraint, index) => (
                    <ConstraintAccordionView
                        key={constraint[constraintId]}
                        constraint={constraint}
                        onEdit={onEdit?.bind(null, constraint)}
                        onDelete={onRemove?.bind(null, index)}
                    />
                ))}
            </ConstraintsList>
        </StyledContainer>
    );
});
