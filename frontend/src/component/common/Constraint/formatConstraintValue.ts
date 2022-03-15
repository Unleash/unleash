import { IConstraint } from 'interfaces/strategy';
import { CURRENT_TIME_CONTEXT_FIELD } from 'component/common/ConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditHeader/ConstraintAccordionEditHeader';
import { formatDateYMDHMS } from 'utils/format-date';
import { ILocationSettings } from 'hooks/useLocationSettings';

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
