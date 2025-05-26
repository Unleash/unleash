import {
    DATE_AFTER,
    IN,
    type Operator,
    isDateOperator,
    isMultiValueOperator,
    type ContextFieldType,
    getOperatorsForContextFieldType,
} from 'constants/operators';
import { CURRENT_TIME_CONTEXT_FIELD } from 'utils/operatorsForContext';
import {
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
    | {
          type: 'set context field';
          payload: { name: string; valueType?: ContextFieldType };
      }
    | { type: 'set operator'; payload: Operator }
    | { type: 'toggle case sensitivity' }
    | { type: 'toggle inverted operator' }
    | { type: 'deleted legal values update'; payload?: Set<string> }
    | { type: 'toggle value'; payload: string };

// Helper to create constraint with appropriate value structure based on operator
const createConstraintWithValue = (
    baseConstraint: Omit<
        EditableConstraintWithDeletedLegalValues,
        'value' | 'values'
    >,
    operator: Operator,
    initialValue?: string | null,
): EditableConstraintWithDeletedLegalValues => {
    const base = { ...baseConstraint, operator };

    if (isMultiValueOperator(operator)) {
        return {
            ...base,
            value: '',
            values: initialValue ? new Set([initialValue]) : new Set(),
        } as EditableMultiValueConstraint;
    }

    return {
        ...base,
        value: initialValue ?? '',
    } as EditableSingleValueConstraint;
};

// Helper to determine if context field should use date operators
const isDateContext = (
    contextName: string,
    valueType?: ContextFieldType,
): boolean => {
    return contextName === CURRENT_TIME_CONTEXT_FIELD || valueType === 'Date';
};

// Helper to get appropriate operator for context field
const getAppropriateOperator = (
    valueType?: ContextFieldType,
    currentOperator?: Operator,
): Operator => {
    const allowedOperators = getOperatorsForContextFieldType(valueType);

    // If current operator is still valid for the new context type, preserve it
    if (currentOperator && allowedOperators.includes(currentOperator)) {
        return currentOperator;
    }

    const firstOperator = allowedOperators[0] || IN;

    // For date contexts, ensure we use a date operator
    if (valueType === 'Date' && !isDateOperator(firstOperator)) {
        return DATE_AFTER;
    }

    return firstOperator;
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
        case 'set context field': {
            if (action.payload.name === state.contextName) {
                return state;
            }

            const { name, valueType } = action.payload;
            const newOperator = getAppropriateOperator(
                valueType,
                state.operator,
            );
            const baseState = { ...state, contextName: name };

            // Handle date contexts with appropriate initial value
            if (isDateContext(name, valueType)) {
                return createConstraintWithValue(
                    baseState,
                    isDateOperator(newOperator) ? newOperator : DATE_AFTER,
                    new Date().toISOString(),
                );
            }

            // Handle other contexts
            return createConstraintWithValue(baseState, newOperator);
        }
        case 'set operator':
            if (action.payload === state.operator) {
                return state;
            }

            // For date constraints, preserve the value if switching between date operators
            if (isDateConstraint(state) && isDateOperator(action.payload)) {
                return {
                    ...state,
                    operator: action.payload,
                };
            }

            // For other operator changes, reset values
            return createConstraintWithValue(state, action.payload);
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
            return createConstraintWithValue(state, state.operator);
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
