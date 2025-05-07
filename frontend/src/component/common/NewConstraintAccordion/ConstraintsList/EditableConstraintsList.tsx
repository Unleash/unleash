import type React from 'react';
import { forwardRef } from 'react';
import { styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import produce from 'immer';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { constraintId } from 'component/common/LegacyConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';
import { EditableConstraintWrapper } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraintWrapper';

export interface IEditableConstraintsListRef {
    addConstraint?: (contextName: string) => void;
}

export interface IEditableConstraintsListProps {
    constraints: IConstraint[];
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
}

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

    const onDelete = (index: number) => {
        setConstraints(
            produce((draft) => {
                draft.splice(index, 1);
            }),
        );
    };

    const onAutoSave =
        (id: string | undefined) => (constraint: IConstraint) => {
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
        };

    if (context.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            <ConstraintsList>
                {constraints.map((constraint, index) => (
                    <EditableConstraintWrapper
                        key={constraint[constraintId]}
                        constraint={constraint}
                        onDelete={() => onDelete(index)}
                        onAutoSave={onAutoSave(constraint[constraintId])}
                    />
                ))}
            </ConstraintsList>
        </StyledContainer>
    );
});
