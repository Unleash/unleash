import { createUuid } from 'utils/createUuid';
import { constraintId } from 'constants/constraintId';
import type { IConstraintWithId } from 'interfaces/strategy';
import { operatorsForContext } from 'utils/operatorsForContext';

export const createEmptyConstraint = (
    contextName: string,
): IConstraintWithId => {
    const operator = operatorsForContext(contextName)[0];

    return {
        contextName,
        operator,
        value: '',
        values: [],
        caseInsensitive: false,
        inverted: false,
        [constraintId]: createUuid(),
    };
};
