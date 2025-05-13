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
} from './editable-constraint-type';
import { difference, union } from './set-functions';

export type ConstraintUpdateAction =
    | { type: 'add value(s)'; payload: string | string[] }
    | { type: 'clear values' }
    | { type: 'remove value'; payload: string }
    | { type: 'set context field'; payload: string }
    | { type: 'set operator'; payload: Operator }
    | { type: 'toggle case sensitivity' }
    | { type: 'toggle inverted operator' }
    | { type: 'toggle value'; payload: string };

const withValue = <
    T extends EditableConstraint & { value?: string; values?: Set<string> },
>(
    newValue: string | null,
    constraint: T,
): EditableConstraint => {
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
    state: EditableConstraint,
    action: ConstraintUpdateAction,
    deletedLegalValues?: Set<string>,
): EditableConstraint => {
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
            if (isSingleValueConstraint(state)) {
                const newValue = Array.isArray(action.payload)
                    ? action.payload[0]
                    : action.payload;
                if (deletedLegalValues?.has(newValue)) {
                    if (deletedLegalValues?.has(state.value)) {
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

            const newValues = new Set(
                Array.isArray(action.payload)
                    ? action.payload
                    : [action.payload],
            );
            const combinedValues = union(state.values, newValues);
            const filteredValues = deletedLegalValues
                ? difference(combinedValues, deletedLegalValues)
                : combinedValues;
            return {
                ...state,
                values: filteredValues,
            };
        }
        case 'toggle inverted operator':
            return { ...state, inverted: !state.inverted };
        case 'toggle case sensitivity':
            return { ...state, caseInsensitive: !state.caseInsensitive };
        case 'remove value':
            if (isSingleValueConstraint(state)) {
                if (state.value === action.payload) {
                    return {
                        ...state,
                        value: '',
                    };
                } else {
                    return state;
                }
            }
            state.values.delete(action.payload);
            return {
                ...state,
                values: state.values ?? new Set(),
            };
        case 'clear values':
            return withValue(null, state);
        case 'toggle value':
            if (isMultiValueConstraint(state)) {
                if (state.values.has(action.payload)) {
                    state.values.delete(action.payload);
                    return {
                        ...state,
                        values: state.values ?? new Set(),
                    };
                } else {
                    const newValues = new Set(
                        Array.isArray(action.payload)
                            ? action.payload
                            : [action.payload],
                    );
                    const combinedValues = union(state.values, newValues);
                    const filteredValues = deletedLegalValues
                        ? difference(combinedValues, deletedLegalValues)
                        : combinedValues;
                    return {
                        ...state,
                        values: filteredValues,
                    };
                }
            } else {
                if (state.value === action.payload) {
                    return {
                        ...state,
                        value: '',
                    };
                } else {
                    if (deletedLegalValues?.has(action.payload)) {
                        if (deletedLegalValues?.has(state.value)) {
                            return {
                                ...state,
                                value: '',
                            };
                        }
                        return state;
                    }
                    return {
                        ...state,
                        value: action.payload,
                    };
                }
            }
    }
};
