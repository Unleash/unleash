import { useState } from 'react';
import type { IConstraint } from 'interfaces/strategy';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import type { IUnleashContextDefinition } from 'interfaces/context';
import {
    DATE_AFTER,
    dateOperators,
    IN,
    singleValueOperators,
    type Operator,
} from 'constants/operators';
import { EditableConstraint } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint';
import { CURRENT_TIME_CONTEXT_FIELD } from 'utils/operatorsForContext';
import produce from 'immer';

interface IConstraintAccordionEditProps {
    constraint: IConstraint;
    onDelete: () => void;
    onAutoSave: (constraint: IConstraint) => void;
}

export const CANCEL = 'cancel';
export const SAVE = 'save';

const resolveContextDefinition = (
    context: IUnleashContextDefinition[],
    contextName: string,
): IUnleashContextDefinition => {
    const definition = context.find(
        (contextDef) => contextDef.name === contextName,
    );

    return (
        definition || {
            name: '',
            description: '',
            createdAt: '',
            sortOrder: 1,
            stickiness: false,
        }
    );
};

type ConstraintUpdateAction =
    | { type: 'add value(s)'; payload: string[] }
    | { type: 'set value'; payload: string }
    | { type: 'clear values' }
    | { type: 'remove value from list'; payload: string }
    | { type: 'set context field'; payload: string }
    | { type: 'set operator'; payload: Operator }
    | { type: 'toggle case sensitivity' }
    | { type: 'toggle inverted operator' };

type ConstraintWithValueSet = Omit<IConstraint, 'values'> & {
    values?: Set<string>;
};

const cleanConstraint = (
    constraint: Readonly<ConstraintWithValueSet>,
): ConstraintWithValueSet => {
    return produce(constraint, (draft) => {
        if (singleValueOperators.includes(constraint.operator)) {
            delete draft.values;
        } else {
            delete draft.value;
        }
    });
};

export const EditableConstraintWrapper = ({
    constraint,
    onDelete,
    onAutoSave,
}: IConstraintAccordionEditProps) => {
    const constraintReducer = (
        state: ConstraintWithValueSet,
        action: ConstraintUpdateAction,
    ): ConstraintWithValueSet => {
        switch (action.type) {
            case 'set context field':
                if (
                    action.payload === CURRENT_TIME_CONTEXT_FIELD &&
                    !dateOperators.includes(state.operator)
                ) {
                    return cleanConstraint({
                        ...state,
                        contextName: action.payload,
                        operator: DATE_AFTER,
                        values: new Set(),
                        value: new Date().toISOString(),
                    });
                } else if (
                    action.payload !== CURRENT_TIME_CONTEXT_FIELD &&
                    dateOperators.includes(state.operator)
                ) {
                    return cleanConstraint({
                        ...state,
                        operator: IN,
                        contextName: action.payload,
                        values: new Set(),
                        value: '',
                    });
                }

                return cleanConstraint({
                    ...state,
                    contextName: action.payload,
                    values: new Set(),

                    value: '',
                });
            case 'set operator':
                if (
                    dateOperators.includes(state.operator) &&
                    dateOperators.includes(action.payload)
                ) {
                    return cleanConstraint({
                        ...state,
                        operator: action.payload,
                        value: state.value,
                    });
                }
                return cleanConstraint({
                    ...state,
                    operator: action.payload,
                    values: new Set(),
                    value: '',
                });
            case 'add value(s)': {
                return {
                    ...state,
                    values: state.values?.union(new Set(action.payload)),
                };
            }
            case 'set value':
                return { ...state, value: action.payload };
            case 'toggle inverted operator':
                return { ...state, inverted: !state.inverted };
            case 'toggle case sensitivity':
                return { ...state, caseInsensitive: !state.inverted };
            case 'remove value from list':
                state.values?.delete(action.payload);
                return {
                    ...state,
                    values: state.values ?? new Set(),
                };
            case 'clear values':
                return cleanConstraint({
                    ...state,
                    values: new Set(),
                    value: '',
                });
        }
    };

    const [localConstraint, setLocalConstraint] = useState(() => {
        const withSet = {
            ...constraint,
            values: new Set(constraint.values),
        };
        return cleanConstraint(withSet);
    });

    const { context } = useUnleashContext();
    const [contextDefinition, setContextDefinition] = useState(
        resolveContextDefinition(context, localConstraint.contextName),
    );

    const updateConstraint = (action: ConstraintUpdateAction) => {
        const nextState = constraintReducer(localConstraint, action);
        const contextFieldHasChanged =
            localConstraint.contextName !== nextState.contextName;

        setLocalConstraint(nextState);
        onAutoSave({
            ...nextState,
            values: Array.from(nextState.values ?? []),
        });

        if (contextFieldHasChanged) {
            setContextDefinition(
                resolveContextDefinition(context, nextState.contextName),
            );
        }
    };

    return (
        <EditableConstraint
            localConstraint={localConstraint}
            onDelete={onDelete}
            constraintValues={constraint?.values || []}
            contextDefinition={contextDefinition}
            updateConstraint={updateConstraint}
        />
    );
};
