import { CURRENT_TIME_CONTEXT_FIELD } from 'component/common/ConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditHeader/ConstraintAccordionEditHeader';
import { allOperators, dateOperators, Operator } from 'constants/operators';
import { oneOf } from 'utils/oneOf';

export const operatorsForContext = (contextName: string): Operator[] => {
    return allOperators.filter(operator => {
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
