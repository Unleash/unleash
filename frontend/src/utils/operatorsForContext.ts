import {
    allOperators,
    dateOperators,
    type Operator,
    IN,
    NOT_IN,
    STR_CONTAINS,
    STR_STARTS_WITH,
    STR_ENDS_WITH,
} from 'constants/operators';
import { oneOf } from 'utils/oneOf';
import type { IUnleashContextDefinition } from 'interfaces/context';

export const CURRENT_TIME_CONTEXT_FIELD = 'currentTime';

// Operators to use when a context field has legal values
export const LEGAL_VALUES_OPERATORS: Operator[] = [
    IN,
    NOT_IN,
    STR_CONTAINS,
    STR_STARTS_WITH,
    STR_ENDS_WITH,
];

export const operatorsForContext = (
    contextName: string,
    contextDefinition?: Pick<IUnleashContextDefinition, 'legalValues'>,
): Operator[] => {
    if (
        contextDefinition?.legalValues &&
        contextDefinition.legalValues.length > 0
    ) {
        return LEGAL_VALUES_OPERATORS;
    }

    return allOperators.filter((operator) => {
        if (
            oneOf(dateOperators, operator) &&
            contextName !== CURRENT_TIME_CONTEXT_FIELD
        ) {
            return false;
        }

        if (
            !oneOf(dateOperators, operator) &&
            contextName === CURRENT_TIME_CONTEXT_FIELD
        ) {
            return false;
        }

        return true;
    });
};
