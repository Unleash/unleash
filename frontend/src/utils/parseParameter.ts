import type { ParametersSchema } from 'openapi';

export const parseParameterNumber = (
    value?: ParametersSchema[string] | number,
): number => {
    const parsed = Number(parseParameterString(value));
    return Number.isFinite(parsed) ? parsed : 0;
};

export const parseParameterString = (
    value?: ParametersSchema[string] | number,
): string => {
    return String(value ?? '').trim();
};

export const parseParameterStrings = (
    value?: ParametersSchema[string] | number,
): string[] => {
    return parseParameterString(value)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
};
