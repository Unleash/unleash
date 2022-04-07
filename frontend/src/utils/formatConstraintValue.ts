import { IConstraint } from 'interfaces/strategy';
import { formatDateYMDHMS } from 'utils/formatDate';
import { ILocationSettings } from 'hooks/useLocationSettings';
import { CURRENT_TIME_CONTEXT_FIELD } from 'utils/operatorsForContext';

export const formatConstraintValuesOrValue = (
    constraint: IConstraint,
    locationSettings: ILocationSettings
): string | undefined => {
    return (
        formatConstraintValues(constraint) ??
        formatConstraintValue(constraint, locationSettings)
    );
};

export const formatConstraintValues = (
    constraint: IConstraint
): string | undefined => {
    if (constraint.values && constraint.values.length > 0) {
        return constraint.values.join(', ');
    }
};

export const formatConstraintValue = (
    constraint: IConstraint,
    locationSettings: ILocationSettings
): string | undefined => {
    if (
        constraint.value &&
        constraint.contextName === CURRENT_TIME_CONTEXT_FIELD
    ) {
        return formatDateYMDHMS(constraint.value, locationSettings.locale);
    }

    return constraint.value;
};
