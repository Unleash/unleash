import { constraintId } from 'constants/constraintId';
import { isDateOperator, isSingleValueOperator } from 'constants/operators';
import type { IConstraintWithId } from 'interfaces/strategy';
import { operatorsForContext } from 'utils/operatorsForContext';
import { v4 as uuidv4 } from 'uuid';

export const createEmptyConstraint = (
    contextName: string,
): IConstraintWithId => {
    const operator = operatorsForContext(contextName)[0];

    const makeConstraint = (
        props: { value: string } | { values: string[] },
    ): IConstraintWithId => {
        return {
            contextName,
            operator,
            ...props,
            caseInsensitive: false,
            inverted: false,
            [constraintId]: uuidv4(),
        };
    };

    if (isSingleValueOperator(operator)) {
        const value = isDateOperator(operator) ? new Date().toISOString() : '';

        return makeConstraint({ value });
    }

    return makeConstraint({ values: [] });
};
