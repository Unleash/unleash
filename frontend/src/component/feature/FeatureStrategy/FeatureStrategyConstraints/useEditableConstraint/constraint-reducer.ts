import {
    DATE_AFTER,
    IN,
    type Operator,
    isDateOperator,
    isSingleValueOperator,
} from 'constants/operators';
import { CURRENT_TIME_CONTEXT_FIELD } from 'utils/operatorsForContext';
import {
    isDateConstraint,
    isMultiValueConstraint,
    isSingleValueConstraint,
    type EditableConstraint,
} from './editable-constraint-type';

export type ConstraintUpdateAction =
    | { type: 'add value(s)'; payload: string[] }
    | { type: 'set value'; payload: string }
    | { type: 'clear values' }
    | { type: 'remove value from list'; payload: string }
    | { type: 'set context field'; payload: string }
    | { type: 'set operator'; payload: Operator }
    | { type: 'toggle case sensitivity' }
    | { type: 'toggle inverted operator' };

const resetValues = (state: EditableConstraint): EditableConstraint => {
    if (isSingleValueConstraint(state)) {
        if ('values' in state) {
            const { values, ...rest } = state;
            return {
                ...rest,
                value: '',
            };
        }
        return {
            ...state,
            value: '',
        };
    }

    if ('value' in state) {
        const { value, ...rest } = state;
        return {
            ...rest,
            values: new Set(),
        };
    }
    return {
        ...state,
        values: new Set(),
    };
};

// because Set.prototype.union and difference are baseline available 2024, but
// not available in GH actions yet. Caniuse also reports coverage at 87%. we can
// likely remove these in favor of the native implementations the next time we
// touch this code.
const union = <T>(setA: Set<T>, setB: Set<T>) => {
    const result = new Set(setA);
    for (const element of setB) {
        result.add(element);
    }
    return result;
};

const difference = <T>(setA: Set<T>, setB: Set<T>) => {
    const result = new Set(setA);
    for (const element of setA) {
        if (!setB.has(element)) {
            result.add(element);
        }
    }
    return result;
};

export const constraintReducer = (
    state: EditableConstraint,
    action: ConstraintUpdateAction,
    deletedLegalValues?: Set<string>,
): EditableConstraint => {
    switch (action.type) {
        case 'set context field':
            if (
                action.payload === CURRENT_TIME_CONTEXT_FIELD &&
                !isDateOperator(state.operator)
            ) {
                return {
                    ...state,
                    contextName: action.payload,
                    operator: DATE_AFTER,
                    value: new Date().toISOString(),
                };
            } else if (
                action.payload !== CURRENT_TIME_CONTEXT_FIELD &&
                isDateOperator(state.operator)
            ) {
                return {
                    ...state,
                    operator: IN,
                    contextName: action.payload,
                    values: new Set(),
                };
            }

            return resetValues({
                ...state,
                contextName: action.payload,
            });
        case 'set operator':
            if (isDateConstraint(state) && isDateOperator(action.payload)) {
                return {
                    ...state,
                    operator: action.payload,
                };
            }

            if (isSingleValueOperator(action.payload)) {
                return resetValues({
                    ...state,
                    value: '',
                    operator: action.payload,
                });
            }
            return resetValues({
                ...state,
                values: new Set(),
                operator: action.payload,
            });
        case 'add value(s)': {
            if (!('values' in state)) {
                return state;
            }

            const newValues = new Set(action.payload);
            const combinedValues = union(state.values, newValues);
            const filteredValues = deletedLegalValues
                ? difference(combinedValues, deletedLegalValues)
                : combinedValues;
            return {
                ...state,
                values: filteredValues,
            };
        }
        case 'set value':
            if (isMultiValueConstraint(state)) {
                return state;
            }
            return { ...state, value: action.payload };
        case 'toggle inverted operator':
            return { ...state, inverted: !state.inverted };
        case 'toggle case sensitivity':
            return { ...state, caseInsensitive: !state.inverted };
        case 'remove value from list':
            if (isSingleValueConstraint(state)) {
                return state;
            }
            state.values.delete(action.payload);
            return {
                ...state,
                values: state.values ?? new Set(),
            };
        case 'clear values':
            return resetValues(state);
    }
};
