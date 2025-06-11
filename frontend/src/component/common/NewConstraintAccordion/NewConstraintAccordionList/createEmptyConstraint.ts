import { dateOperators } from 'constants/operators';
import type { IConstraint } from 'interfaces/strategy';
import { oneOf } from 'utils/oneOf';
import { operatorsForContext } from 'utils/operatorsForContext';
import { v4 as uuidv4 } from 'uuid';

export const constraintId = Symbol('id');

type ConstraintWithId = IConstraint & {
    [constraintId]: string;
};

export const createEmptyEditableConstraint = (
    contextName: string,
): ConstraintWithId => {
    const operator = operatorsForContext(contextName)[0];

    const value = oneOf(dateOperators, operator)
        ? new Date().toISOString()
        : '';

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
