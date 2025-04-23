import type React from 'react';
import { forwardRef, Fragment } from 'react';
import { styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import produce from 'immer';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import type { IUseWeakMap } from 'hooks/useWeakMap';
import { constraintId } from 'component/common/LegacyConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/LegacyStrategySeparator';
import { NewConstraintAccordion } from 'component/common/NewConstraintAccordion/NewConstraintAccordion';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';
import { useUiFlag } from 'hooks/useUiFlag';
import { EditableConstraintWrapper } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraintWrapper';

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
    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign');
    const addEditStrategy = useUiFlag('addEditStrategy');

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

    if (flagOverviewRedesign) {
        return (
            <StyledContainer id={constraintAccordionListId}>
                <ConstraintsList>
                    {constraints.map((constraint, index) =>
                        addEditStrategy ? (
                            <EditableConstraintWrapper
                                key={constraint[constraintId]}
                                constraint={constraint}
                                onCancel={onCancel.bind(null, index)}
                                onDelete={onRemove?.bind(null, index)}
                                onSave={onSave!.bind(null, index)}
                                onAutoSave={onAutoSave?.(
                                    constraint[constraintId],
                                )}
                            />
                        ) : (
                            <NewConstraintAccordion
                                key={constraint[constraintId]}
                                constraint={constraint}
                                onEdit={onEdit?.bind(null, constraint)}
                                onCancel={onCancel.bind(null, index)}
                                onDelete={onRemove?.bind(null, index)}
                                onSave={onSave?.bind(null, index)}
                                onAutoSave={onAutoSave?.(
                                    constraint[constraintId],
                                )}
                                editing={Boolean(
                                    state.get(constraint)?.editing,
                                )}
                                compact
                            />
                        ),
                    )}
                </ConstraintsList>
            </StyledContainer>
        );
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
