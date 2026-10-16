import type { ConstraintSchema } from 'openapi';
import type { ILocationSettings } from 'hooks/useLocationSettings';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { formatOperatorDescription } from 'utils/formatOperatorDescription';

const MAX_LISTED_VALUES = 10;

export const formatConstraintText = (
    constraint: ConstraintSchema,
    locationSettings: ILocationSettings,
): string => {
    const { contextName, operator, inverted, values } = constraint;
    const formattedValue = formatConstraintValue(constraint, locationSettings);
    const items = formattedValue
        ? [formattedValue, ...(values ?? [])]
        : (values ?? []);
    const operatorText = formatOperatorDescription(operator, inverted);
    const valuesText =
        items.length > MAX_LISTED_VALUES
            ? `(${items.length} values)`
            : items.join(', ');

    return `${contextName} ${operatorText} ${valuesText}`.trim();
};
