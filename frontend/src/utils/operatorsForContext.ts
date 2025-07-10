import {
    allOperators,
    isDateOperator,
    type Operator,
} from 'constants/operators';

export const CURRENT_TIME_CONTEXT_FIELD = 'currentTime';

export const operatorsForContext = (contextName: string): Operator[] => {
    return allOperators.filter((operator) => {
        if (
            isDateOperator(operator) &&
            contextName !== CURRENT_TIME_CONTEXT_FIELD
        ) {
            return false;
        }

        if (
            !isDateOperator(operator) &&
            contextName === CURRENT_TIME_CONTEXT_FIELD
        ) {
            return false;
        }

        return true;
    });
};
