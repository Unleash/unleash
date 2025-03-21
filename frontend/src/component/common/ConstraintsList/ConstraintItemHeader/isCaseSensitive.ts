import {
    inOperators,
    stringOperators,
    type Operator,
} from 'constants/operators';

export const isCaseSensitive = (
    operator: Operator,
    caseInsensitive?: boolean,
) =>
    inOperators.includes(operator) ||
    (stringOperators.includes(operator) && !caseInsensitive);
