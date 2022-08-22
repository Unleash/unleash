import {
    IStrategyParameter,
    IFeatureStrategyParameters,
} from 'interfaces/strategy';

export const validateParameterValue = (
    definition: Pick<IStrategyParameter, 'type' | 'required'>,
    value: IFeatureStrategyParameters[string]
): string | undefined => {
    const { type, required } = definition;

    // The components for booleans and percentages can't yet show error messages.
    // We should not enforce `required` until these errors can be shown in the UI.
    const shouldValidateRequired =
        type === 'string' || type === 'list' || type === 'number';
    if (shouldValidateRequired && required && value === '') {
        return 'Field is required';
    }

    const shouldValidateNumeric = type === 'percentage' || type === 'number';
    if (shouldValidateNumeric && !isValidNumberOrEmpty(value)) {
        return 'Not a valid number.';
    }

    if (type === 'boolean' && !isValidBooleanOrEmpty(value)) {
        return 'Not a valid boolean.';
    }
};

const isValidNumberOrEmpty = (value: string | number | undefined): boolean => {
    return value === '' || /^\d+$/.test(String(value));
};

const isValidBooleanOrEmpty = (value: string | number | undefined): boolean => {
    return value === '' || value === 'true' || value === 'false';
};
