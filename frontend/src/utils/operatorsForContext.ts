import {
    allOperators,
    dateOperators,
    type Operator,
} from 'constants/operators';
import { oneOf } from 'utils/oneOf';
import type { IUnleashContextDefinition } from 'interfaces/context';

export const CURRENT_TIME_CONTEXT_FIELD = 'currentTime';

export const operatorsForContext = (contextName: string): Operator[] => {
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

export const getContextField = (
    context: IUnleashContextDefinition[],
    contextName: string,
): IUnleashContextDefinition | undefined => {
    return context.find((field) => field.name === contextName);
};
