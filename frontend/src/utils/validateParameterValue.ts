import {
    IStrategyParameter,
    IFeatureStrategyParameters,
} from 'interfaces/strategy';

export const validateParameterValue = (
    definition: IStrategyParameter,
    value: IFeatureStrategyParameters[string]
): string | undefined => {
    const { type, required } = definition;

    if (required && value === '') {
        return 'Field is required';
    }

    if (type === 'number' && !isValidNumberOrEmpty(value)) {
        return 'Not a valid number.';
    }
};

const isValidNumberOrEmpty = (value: string | number | undefined): boolean => {
    return value === '' || /^\d+$/.test(String(value));
};
