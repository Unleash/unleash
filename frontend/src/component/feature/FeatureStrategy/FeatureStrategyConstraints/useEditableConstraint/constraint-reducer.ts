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
            const combinedValues = state.values.union(newValues);
            const filteredValues = deletedLegalValues
                ? combinedValues.difference(deletedLegalValues)
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
