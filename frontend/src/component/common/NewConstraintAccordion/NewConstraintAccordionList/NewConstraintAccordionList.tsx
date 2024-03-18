import type React from 'react';
import { forwardRef, Fragment, useImperativeHandle } from 'react';
import { styled, Tooltip } from '@mui/material';
import HelpOutline from '@mui/icons-material/HelpOutline';
import type { IConstraint } from 'interfaces/strategy';
import produce from 'immer';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { type IUseWeakMap, useWeakMap } from 'hooks/useWeakMap';
import {
    constraintId,
    createEmptyConstraint,
} from 'component/common/ConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { NewConstraintAccordion } from 'component/common/NewConstraintAccordion/NewConstraintAccordion';

export interface IConstraintAccordionListProps {
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

export const useConstraintAccordionList = (
    setConstraints:
        | React.Dispatch<React.SetStateAction<IConstraint[]>>
        | undefined,
    ref: React.RefObject<IConstraintAccordionListRef>,
) => {
    // Constraint metadata: This is a weak map to give a constraint an ID by using the placement in memory.
    const state = useWeakMap<IConstraint, IConstraintAccordionListItemState>();
    const { context } = useUnleashContext();

    const addConstraint =
        setConstraints &&
        ((contextName: string) => {
            const constraint = createEmptyConstraint(contextName);
            state.set(constraint, { editing: true, new: true });
            setConstraints((prev) => [...prev, constraint]);
        });

    useImperativeHandle(ref, () => ({
        addConstraint,
    }));

    const onAdd =
        addConstraint &&
        (() => {
            addConstraint(context[0].name);
        });

    return { onAdd, state, context };
};
interface IConstraintList {
    constraints: IConstraint[];
    setConstraints?: React.Dispatch<React.SetStateAction<IConstraint[]>>;
    state: IUseWeakMap<IConstraint, IConstraintAccordionListItemState>;
}

export const NewConstraintAccordionList = forwardRef<
    IConstraintAccordionListRef | undefined,
    IConstraintList
>(({ constraints, setConstraints, state }, ref) => {
    const { context } = useUnleashContext();

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
        <StyledContainer id={constraintAccordionListId}>
            {constraints.map((constraint, index) => {
                const id = constraint[constraintId];

                return (
                    <Fragment key={id}>
                        <ConditionallyRender
                            condition={index > 0}
                            show={<StrategySeparator text='AND' />}
                        />

                        <NewConstraintAccordion
                            constraint={constraint}
                            onEdit={onEdit?.bind(null, constraint)}
                            onCancel={onCancel.bind(null, index)}
                            onDelete={onRemove?.bind(null, index)}
                            onSave={onSave?.bind(null, index)}
                            onAutoSave={onAutoSave?.(id)}
                            editing={Boolean(state.get(constraint)?.editing)}
                            compact
                        />
                    </Fragment>
                );
            })}
        </StyledContainer>
    );
});
