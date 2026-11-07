import type { ConstraintSchema } from 'openapi';
import type { ILocationSettings } from 'hooks/useLocationSettings';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { formatOperatorDescription } from 'utils/formatOperatorDescription';

const MAX_LISTED_VALUES = 10;

export const constraintTextParts = (
    constraint: ConstraintSchema,
    locationSettings: ILocationSettings,
): { contextName: string; operatorText: string; values: string[] } => {
    const { contextName, operator, inverted, values } = constraint;
    const formattedValue = formatConstraintValue(constraint, locationSettings);
    const items = formattedValue
        ? [formattedValue, ...(values ?? [])]
        : (values ?? []);
    const operatorText = formatOperatorDescription(operator, inverted);

    return { contextName, operatorText, values: items };
};

export const formatConstraintText = (
    constraint: ConstraintSchema,
    locationSettings: ILocationSettings,
): string => {
    const { contextName, operatorText, values } = constraintTextParts(
        constraint,
        locationSettings,
    );
    const valuesText =
        values.length > MAX_LISTED_VALUES
            ? `(${values.length} values)`
            : values.join(', ');

    return `${contextName} ${operatorText} ${valuesText}`.trim();
};
