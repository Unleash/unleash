import { constraintId } from 'constants/constraintId';
import { isDateOperator } from 'constants/operators';
import type { IConstraint } from 'interfaces/strategy';
import { operatorsForContext } from 'utils/operatorsForContext';
import { v4 as uuidv4 } from 'uuid';

export const createEmptyConstraint = (contextName: string): IConstraint => {
    const operator = operatorsForContext(contextName)[0];

    const value = isDateOperator(operator) ? new Date().toISOString() : '';

    return {
        contextName,
        operator,
        value,
        values: [],
        caseInsensitive: false,
        inverted: false,
        [constraintId]: uuidv4(),
    };
};
