import { formatDateYMDHMS } from 'utils/formatDate';
import type { ILocationSettings } from 'hooks/useLocationSettings';
import { CURRENT_TIME_CONTEXT_FIELD } from 'utils/operatorsForContext';
import { DATE_AFTER, DATE_BEFORE } from 'constants/operators';
import type { ConstraintSchema } from 'openapi';

const dateOperators: ConstraintSchema['operator'][] = [DATE_AFTER, DATE_BEFORE];

export const formatConstraintValue = (
    constraint: Pick<ConstraintSchema, 'value' | 'contextName' | 'operator'>,
    locationSettings: ILocationSettings,
): string | undefined => {
    const isDateValue =
        constraint.contextName === CURRENT_TIME_CONTEXT_FIELD ||
        dateOperators.includes(constraint.operator);

    if (constraint.value && isDateValue) {
        return formatDateYMDHMS(constraint.value, locationSettings.locale);
    }

    return constraint.value;
};
