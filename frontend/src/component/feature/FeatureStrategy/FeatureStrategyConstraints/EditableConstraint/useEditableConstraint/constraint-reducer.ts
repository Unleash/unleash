import {
    DATE_AFTER,
    IN,
    type Operator,
    isDateOperator,
    isMultiValueOperator,
    isSingleValueOperator,
} from 'constants/operators';
import { CURRENT_TIME_CONTEXT_FIELD } from 'utils/operatorsForContext';
import {
    type EditableDateConstraint,
    isDateConstraint,
    isSingleValueConstraint,
    type EditableConstraint,
    type EditableMultiValueConstraint,
    type EditableSingleValueConstraint,
    isMultiValueConstraint,
} from './editable-constraint-type.js';
import { difference, union } from './set-functions.js';

type EditableConstraintWithDeletedLegalValues = EditableConstraint & {
    deletedLegalValues?: Set<string>;
};

export type ConstraintUpdateAction =
    | { type: 'add value(s)'; payload: string | string[] }
    | { type: 'clear values' }
    | { type: 'remove value'; payload: string }
    | { type: 'set context field'; payload: string }
    | { type: 'set operator'; payload: Operator }
    | { type: 'toggle case sensitivity' }
    | { type: 'toggle inverted operator' }
    | { type: 'deleted legal values update'; payload?: Set<string> }
    | { type: 'toggle value'; payload: string };

const withValue = <
    T extends EditableConstraintWithDeletedLegalValues & {
        value?: string;
        values?: Set<string>;
    },
>(
    newValue: string | null,
    constraint: T,
): EditableConstraintWithDeletedLegalValues => {
    const { value, values, ...rest } = constraint;
    if (isMultiValueOperator(constraint.operator)) {
        return {
            ...rest,
            values: new Set([newValue].filter(Boolean)),
        } as EditableConstraint;
    }
    return {
        ...rest,
        value: newValue ?? '',
    } as EditableConstraint;
};

export const constraintReducer = (
    state: EditableConstraintWithDeletedLegalValues,
    action: ConstraintUpdateAction,
): EditableConstraintWithDeletedLegalValues => {
    const removeValue = (value: string) => {
        if (isSingleValueConstraint(state)) {
            if (state.value === value) {
                return {
                    ...state,
                    value: '',
                };
            } else {
                return state;
            }
        }
        const updatedValues = difference(state.values, new Set([value]));
        return {
            ...state,
            values: updatedValues ?? new Set(),
        };
    };

    const addValue = (value: string | string[]) => {
        if (isSingleValueConstraint(state)) {
            const newValue = Array.isArray(value) ? value[0] : value;
            if (state.deletedLegalValues?.has(newValue)) {
                if (state.deletedLegalValues?.has(state.value)) {
                    return {
                        ...state,
                        value: '',
                    };
                }
                return state;
            }
            return {
                ...state,
                value: newValue ?? '',
            };
        }

        const newValues = new Set(Array.isArray(value) ? value : [value]);
        const combinedValues = union(state.values, newValues);
        const filteredValues = state.deletedLegalValues
            ? difference(combinedValues, state.deletedLegalValues)
            : combinedValues;
        return {
            ...state,
            values: filteredValues,
        };
    };

    switch (action.type) {
        case 'set context field':
            if (action.payload === state.contextName) {
                return state;
            }
            if (
                action.payload === CURRENT_TIME_CONTEXT_FIELD &&
                !isDateOperator(state.operator)
            ) {
                return withValue(new Date().toISOString(), {
                    ...state,
                    contextName: action.payload,
                    operator: DATE_AFTER,
                } as EditableDateConstraint);
            } else if (
                action.payload !== CURRENT_TIME_CONTEXT_FIELD &&
                isDateOperator(state.operator)
            ) {
                return withValue(null, {
                    ...state,
                    operator: IN,
                    contextName: action.payload,
                } as EditableMultiValueConstraint);
            }

            return withValue(null, {
                ...state,
                contextName: action.payload,
            });
        case 'set operator':
            if (action.payload === state.operator) {
                return state;
            }
            if (isDateConstraint(state) && isDateOperator(action.payload)) {
                return {
                    ...state,
                    operator: action.payload,
                };
            }

            if (isSingleValueOperator(action.payload)) {
                return withValue(null, {
                    ...state,
                    operator: action.payload,
                } as EditableSingleValueConstraint);
            }
            return withValue(null, {
                ...state,
                operator: action.payload,
            } as EditableMultiValueConstraint);
        case 'add value(s)': {
            return addValue(action.payload);
        }
        case 'toggle inverted operator':
            return { ...state, inverted: !state.inverted };
        case 'toggle case sensitivity':
            return { ...state, caseInsensitive: !state.caseInsensitive };
        case 'remove value':
            return removeValue(action.payload);
        case 'clear values':
            return withValue(null, state);
        case 'toggle value':
            if (
                (isSingleValueConstraint(state) &&
                    state.value === action.payload) ||
                (isMultiValueConstraint(state) &&
                    state.values.has(action.payload))
            ) {
                return removeValue(action.payload);
            }
            return addValue(action.payload);
        case 'deleted legal values update':
            return {
                ...state,
                deletedLegalValues: action.payload,
            };
    }
};
