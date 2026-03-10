import type React from 'react';
import { useCallback, useEffect, useImperativeHandle, memo } from 'react';
import { forwardRef } from 'react';
import { styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import produce from 'immer';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';
import { EditableConstraint } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint/EditableConstraint';
import { createEmptyConstraint } from '../../../../utils/createEmptyConstraint.ts';
import { constraintId } from 'constants/constraintId.ts';

import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext.ts';

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

type ConstraintItemProps = {
    constraint: IConstraint;
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
};

const ConstraintItem = memo(
    ({ constraint, setConstraints }: ConstraintItemProps) => {
        const id = constraint[constraintId] as string;
        const handleDelete = useCallback(
            () =>
                setConstraints(
                    produce((draft) => {
                        const index = draft.findIndex(
                            (constraint) => constraint[constraintId] === id,
                        );
                        if (index !== -1) draft.splice(index, 1);
                    }),
                ),
            [id, setConstraints],
        );
        const handleUpdate = useCallback(
            (updated: IConstraint) =>
                setConstraints(
                    produce((draft) =>
                        draft.map((oldConstraint) =>
                            oldConstraint[constraintId] === id
                                ? updated
                                : oldConstraint,
                        ),
                    ),
                ),
            [id, setConstraints],
        );
        return (
            <EditableConstraint
                constraint={constraint}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
            />
        );
    },
);

export const EditableConstraintsList = forwardRef<
    IEditableConstraintsListRef | undefined,
    IEditableConstraintsListProps
>(({ constraints, setConstraints }, ref) => {
    const { context } = useAssignableUnleashContext();

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

    if (context.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            <ConstraintsList>
                {constraints.map((constraint) => (
                    <ConstraintItem
                        key={constraint[constraintId]}
                        constraint={constraint}
                        setConstraints={setConstraints}
                    />
                ))}
            </ConstraintsList>
        </StyledContainer>
    );
});
