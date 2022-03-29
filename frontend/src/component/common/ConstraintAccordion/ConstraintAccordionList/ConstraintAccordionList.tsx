import { IConstraint } from 'interfaces/strategy';
import React, { forwardRef, useImperativeHandle } from 'react';
import { ConstraintAccordion } from 'component/common/ConstraintAccordion/ConstraintAccordion';
import produce from 'immer';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    CREATE_FEATURE_STRATEGY,
    UPDATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { useWeakMap } from 'hooks/useWeakMap';
import { objectId } from 'utils/objectId';
import { useStyles } from './ConstraintAccordionList.styles';
import { createEmptyConstraint } from 'component/common/ConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';
import ConditionallyRender from 'component/common/ConditionallyRender';

interface IConstraintAccordionListProps {
    projectId?: string;
    environmentId?: string;
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
>(
    (
        {
            projectId,
            environmentId,
            constraints,
            setConstraints,
            showCreateButton,
        },
        ref
    ) => {
        const state = useWeakMap<
            IConstraint,
            IConstraintAccordionListItemState
        >();
        const { context } = useUnleashContext();
        const styles = useStyles();

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
                    condition={Boolean(showCreateButton && setConstraints)}
                    show={
                        <PermissionButton
                            type="button"
                            onClick={onAdd}
                            variant="text"
                            permission={[
                                UPDATE_FEATURE_STRATEGY,
                                CREATE_FEATURE_STRATEGY,
                            ]}
                            environmentId={environmentId}
                            projectId={projectId}
                        >
                            Add custom constraint
                        </PermissionButton>
                    }
                />
                {constraints.map((constraint, index) => (
                    <ConstraintAccordion
                        key={objectId(constraint)}
                        environmentId={environmentId}
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
    }
);
