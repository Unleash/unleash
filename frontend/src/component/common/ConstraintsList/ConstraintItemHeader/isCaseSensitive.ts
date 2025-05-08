import {
    isInOperator,
    isStringOperator,
    type Operator,
} from 'constants/operators';

export const isCaseSensitive = (
    operator: Operator,
    caseInsensitive?: boolean,
) => isInOperator(operator) || (isStringOperator(operator) && !caseInsensitive);
