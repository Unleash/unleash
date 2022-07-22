import { IConstraint } from 'interfaces/strategy';
import React, { forwardRef, useImperativeHandle } from 'react';
import { ConstraintAccordion } from 'component/common/ConstraintAccordion/ConstraintAccordion';
import produce from 'immer';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { useWeakMap } from 'hooks/useWeakMap';
import { objectId } from 'utils/objectId';
import { useStyles } from './ConstraintAccordionList.styles';
import { createEmptyConstraint } from 'component/common/ConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {Button, Tooltip} from '@mui/material';
import { Help } from '@mui/icons-material';

interface IConstraintAccordionListProps {
    constraints: IConstraint[];
    setConstraints?: React.Dispatch<React.SetStateAction<IConstraint[]>>;
    showCreateButton?: boolean;
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

export const ConstraintAccordionList = forwardRef<
    IConstraintAccordionListRef | undefined,
    IConstraintAccordionListProps
>(({ constraints, setConstraints, showCreateButton }, ref) => {
    const state = useWeakMap<IConstraint, IConstraintAccordionListItemState>();
    const { context } = useUnleashContext();
    const { classes: styles } = useStyles();

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
        <div className={styles.container} id={constraintAccordionListId}>
            <ConditionallyRender
                condition={Boolean(showCreateButton && onAdd)}
                show={
                    <div>
                        <div className={styles.addCustomLabel}>
                            <p>Add any number of custom constraints</p>
                            <Tooltip title="Help" arrow>
                                <a
                                    href={
                                        'https://docs.getunleash.io/advanced/strategy_constraints'
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Help className={styles.help} />
                                </a>
                            </Tooltip>
                        </div>
                        <Button
                            type="button"
                            onClick={onAdd}
                            variant="outlined"
                            color="secondary"
                        >
                            Add custom constraint
                        </Button>
                    </div>
                }
            />
            {constraints.map((constraint, index) => (
                <ConstraintAccordion
                    key={objectId(constraint)}
                    constraint={constraint}
                    onEdit={onEdit && onEdit.bind(null, constraint)}
                    onCancel={onCancel.bind(null, index)}
                    onDelete={onRemove && onRemove.bind(null, index)}
                    onSave={onSave && onSave.bind(null, index)}
                    editing={Boolean(state.get(constraint)?.editing)}
                    compact
                />
            ))}
        </div>
    );
});
