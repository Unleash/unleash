import { IFeatureStrategyParameters } from 'interfaces/strategy';

export const parseParameterNumber = (
    value: IFeatureStrategyParameters[string]
): number => {
    const parsed = Number(parseParameterString(value));
    return Number.isFinite(parsed) ? parsed : 0;
};

export const parseParameterString = (
    value: IFeatureStrategyParameters[string]
): string => {
    return String(value ?? '').trim();
};

export const parseParameterStrings = (
    value: IFeatureStrategyParameters[string]
): string[] => {
    return parseParameterString(value)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
};
