import React, { forwardRef, Fragment, useImperativeHandle } from 'react';
import { Button, styled, Tooltip } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { IConstraint } from 'interfaces/strategy';
import { ConstraintAccordion } from 'component/common/ConstraintAccordion/ConstraintAccordion';
import produce from 'immer';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { useWeakMap } from 'hooks/useWeakMap';
import { objectId } from 'utils/objectId';
import { createEmptyConstraint } from 'component/common/ConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';

interface IConstraintAccordionListProps {
    constraints: IConstraint[];
    setConstraints?: React.Dispatch<React.SetStateAction<IConstraint[]>>;
    showCreateButton?: boolean;
    /* Add "constraints" title on the top - default `true` */
    showLabel?: boolean;
}

// Ref methods exposed by this component.
export interface IConstraintAccordionListRef {
    addConstraint?: (contextName: string) => void;
}

// Extra form state for each constraint.
interface IConstraintAccordionListItemState {
    // Is the constraint new (never been saved)?
    new?: boolean;
    // Is the constraint currently being edited?
    editing?: boolean;
}

export const constraintAccordionListId = 'constraintAccordionListId';

const StyledContainer = styled('div')({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
});

const StyledHelpWrapper = styled(Tooltip)(({ theme }) => ({
    marginLeft: theme.spacing(0.75),
    height: theme.spacing(1.5),
}));

const StyledHelp = styled(HelpOutline)(({ theme }) => ({
    fill: theme.palette.action.active,
    [theme.breakpoints.down(860)]: {
        display: 'none',
    },
}));

const StyledConstraintLabel = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
}));

const StyledAddCustomLabel = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
    display: 'flex',
}));

export const ConstraintAccordionList = forwardRef<
    IConstraintAccordionListRef | undefined,
    IConstraintAccordionListProps
>(
    (
        { constraints, setConstraints, showCreateButton, showLabel = true },
        ref
    ) => {
        const state = useWeakMap<
            IConstraint,
            IConstraintAccordionListItemState
        >();
        const { context } = useUnleashContext();

        const addConstraint =
            setConstraints &&
            ((contextName: string) => {
                const constraint = createEmptyConstraint(contextName);
                state.set(constraint, { editing: true, new: true });
                setConstraints(prev => [...prev, constraint]);
            });

        useImperativeHandle(ref, () => ({
            addConstraint,
        }));

        const onAdd =
            addConstraint &&
            (() => {
                addConstraint(context[0].name);
            });

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
                    produce(draft => {
                        draft.splice(index, 1);
                    })
                );
            });

        const onSave =
            setConstraints &&
            ((index: number, constraint: IConstraint) => {
                state.set(constraint, {});
                setConstraints(
                    produce(draft => {
                        draft[index] = constraint;
                    })
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
            <StyledContainer id={constraintAccordionListId}>
                <ConditionallyRender
                    condition={
                        constraints && constraints.length > 0 && showLabel
                    }
                    show={
                        <StyledConstraintLabel>
                            Constraints
                        </StyledConstraintLabel>
                    }
                />
                {constraints.map((constraint, index) => (
                    <Fragment key={objectId(constraint)}>
                        <ConditionallyRender
                            condition={index > 0}
                            show={<StrategySeparator text="AND" />}
                        />
                        <ConstraintAccordion
                            constraint={constraint}
                            onEdit={onEdit && onEdit.bind(null, constraint)}
                            onCancel={onCancel.bind(null, index)}
                            onDelete={onRemove && onRemove.bind(null, index)}
                            onSave={onSave && onSave.bind(null, index)}
                            editing={Boolean(state.get(constraint)?.editing)}
                            compact
                        />
                    </Fragment>
                ))}
                <ConditionallyRender
                    condition={Boolean(showCreateButton && onAdd)}
                    show={
                        <div>
                            <StyledAddCustomLabel>
                                <p>Add any number of constraints</p>
                                <StyledHelpWrapper
                                    title="View constraints documentation"
                                    arrow
                                >
                                    <a
                                        href={
                                            'https://docs.getunleash.io/reference/strategy-constraints'
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <StyledHelp />
                                    </a>
                                </StyledHelpWrapper>
                            </StyledAddCustomLabel>
                            <Button
                                type="button"
                                onClick={onAdd}
                                variant="outlined"
                                color="primary"
                                data-testid="ADD_CONSTRAINT_BUTTON"
                            >
                                Add constraint
                            </Button>
                        </div>
                    }
                />
            </StyledContainer>
        );
    }
);
