import { createUuid } from 'utils/createUuid';
import type React from 'react';
import { useCallback, useEffect, useImperativeHandle, memo } from 'react';
import { forwardRef } from 'react';
import { styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import produce from 'immer';
import { EditableConstraint } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint/EditableConstraint';
import { createEmptyConstraint } from 'utils/createEmptyConstraint.ts';
import { constraintId } from 'constants/constraintId.ts';
import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext.ts';

export interface IEditableConstraintsListRef {
    addConstraint?: (contextName: string) => void;
}

export interface IEditableConstraintsListProps {
    constraints: IConstraint[];
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
}

const StyledContainer = styled('ul')({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    padding: 0,
    margin: 0,
});

const StyledItem = styled('li')(({ theme }) => ({
    position: 'relative',
    '&:not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

type ConstraintItemProps = {
    constraint: IConstraint;
    setConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
    index: number;
};

const ConstraintItem = memo(
    ({ constraint, setConstraints, index }: ConstraintItemProps) => {
        const handleDelete = useCallback(
            () =>
                setConstraints(
                    produce((draft) => {
                        draft.splice(index, 1);
                    }),
                ),
            [setConstraints, index],
        );
        const handleUpdate = useCallback(
            (updated: IConstraint) =>
                setConstraints(
                    produce((draft) => {
                        draft.splice(index, 1, updated);
                    }),
                ),
            [setConstraints, index],
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
                    [constraintId]: createUuid(),
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
            {constraints.map((constraint, index) => (
                <StyledItem key={constraint[constraintId]}>
                    <ConstraintItem
                        constraint={constraint}
                        setConstraints={setConstraints}
                        index={index}
                    />
                </StyledItem>
            ))}
        </StyledContainer>
    );
});
