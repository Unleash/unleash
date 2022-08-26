import {
    IStrategyParameter,
    IFeatureStrategyParameters,
} from 'interfaces/strategy';

export const validateParameterValue = (
    definition: Pick<IStrategyParameter, 'type' | 'required'>,
    value: IFeatureStrategyParameters[string]
): string | undefined => {
    const { type, required } = definition;

    // Some input components in the feature strategy form can't show error messages.
    // We should not validate those fields until their errors can be shown in the UI.
    if (type !== 'string' && type !== 'list' && type !== 'number') {
        return;
    }

    // If we're editing a feature strategy that has a newly added parameter,
    // the value will be `undefined` until the field has been edited.
    if (required && (typeof value === 'undefined' || value === '')) {
        return 'Field is required';
    }

    if (type === 'number' && !isValidNumberOrEmpty(value)) {
        return 'Not a valid number.';
    }
};

const isValidNumberOrEmpty = (value: string | number | undefined): boolean => {
    return (
        typeof value === 'undefined' ||
        value === '' ||
        /^\d+$/.test(String(value))
    );
};
