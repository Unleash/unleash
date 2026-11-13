import type { IPayload } from 'interfaces/featureToggle';
import { TOTAL_WEIGHT } from './variantWeights.ts';

type ValidatableVariant = {
    name: string;
    weight: number;
    payload?: IPayload;
};

export const isValidPayload = ({ type, value }: IPayload): boolean => {
    if (type === 'json') {
        if (value.trim() === '') {
            return true;
        }
        try {
            JSON.parse(value);
            return true;
        } catch {
            return false;
        }
    }
    if (type === 'number') {
        return !Number.isNaN(Number(value));
    }
    return true;
};

export const isNameUnique = (
    name: string,
    otherVariants: { name: string }[],
): boolean => otherVariants.every((other) => other.name !== name);

export const weightsAddUpTo100 = (variants: { weight: number }[]): boolean =>
    variants.reduce((sum, variant) => sum + (variant.weight || 0), 0) ===
    TOTAL_WEIGHT;

export const isValidVariant = (
    variant: { name: string; payload?: IPayload },
    variants: { name: string }[],
): boolean => {
    const otherVariants = variants.filter((other) => other !== variant);
    return (
        Boolean(variant.name) &&
        isNameUnique(variant.name, otherVariants) &&
        (!variant.payload || isValidPayload(variant.payload))
    );
};

export const strategyVariantsAreValid = (
    variants: ValidatableVariant[],
): boolean =>
    variants.length === 0 ||
    (variants.every((variant) => isValidVariant(variant, variants)) &&
        weightsAddUpTo100(variants));
