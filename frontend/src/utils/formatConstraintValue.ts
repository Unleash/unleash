import { formatDateYMDHMS } from 'utils/formatDate';
import type { ILocationSettings } from 'hooks/useLocationSettings';
import { CURRENT_TIME_CONTEXT_FIELD } from 'utils/operatorsForContext';
import type { ConstraintSchema } from 'openapi';

export const formatConstraintValue = (
    constraint: Pick<ConstraintSchema, 'value' | 'contextName'>,
    locationSettings: ILocationSettings,
): string | undefined => {
    if (
        constraint.value &&
        constraint.contextName === CURRENT_TIME_CONTEXT_FIELD
    ) {
        return formatDateYMDHMS(constraint.value, locationSettings.locale);
    }

    return constraint.value;
};
