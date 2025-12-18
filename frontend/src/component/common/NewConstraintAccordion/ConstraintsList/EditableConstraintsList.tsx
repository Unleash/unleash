import type React from 'react';
import { useEffect, useImperativeHandle } from 'react';
import { forwardRef } from 'react';
import { styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import produce from 'immer';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';
import { EditableConstraint } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint/EditableConstraint';
import { createEmptyConstraint } from '../../../../utils/createEmptyConstraint.ts';
import { constraintId } from 'constants/constraintId.ts';

import { useCombinedGlobalAndProjectContext } from 'hooks/api/getters/useUnleashContext/useCombinedGlobalAndProjectContext.ts';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';

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
    const projectId = useOptionalPathParam('projectId');
    const { context } = useCombinedGlobalAndProjectContext(projectId);

    useImperativeHandle(ref, () => ({
        addConstraint(contextName: string) {
            if (setConstraints) {
                const constraint = createEmptyConstraint(contextName);
                setConstraints((prev) => [...prev, constraint]);
            }
        },
    }));

    useEffect(() => {
        if (!constraints.every((constraint) => constraintId in constraint)) {
            setConstraints(
                constraints.map((constraint) => ({
                    [constraintId]: crypto.randomUUID(),
                    ...constraint,
                })),
            );
        }
    }, [constraints, setConstraints]);

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
                    <EditableConstraint
                        key={constraint[constraintId]}
                        constraint={constraint}
                        onDelete={() => onDelete(index)}
                        onUpdate={onAutoSave(constraint[constraintId])}
                    />
                ))}
            </ConstraintsList>
        </StyledContainer>
    );
});
