import type {
    IUnleashContextDefinition,
    ILegalValue,
} from 'interfaces/context';
import type { IConstraint } from 'interfaces/strategy';

export const resolveLegalValues = (
    values: IConstraint['values'] = [],
    legalValues: IUnleashContextDefinition['legalValues'] = [],
): { legalValues: ILegalValue[]; deletedLegalValues: ILegalValue[] } => {
    if (legalValues.length === 0) {
        return {
            legalValues: [],
            deletedLegalValues: [],
        };
    }

    const existingLegalValues = new Set(legalValues.map(({ value }) => value));
    const deletedLegalValues = values
        .filter((value) => !existingLegalValues.has(value))
        .map((v) => ({ value: v, description: '' }));

    return {
        legalValues,
        deletedLegalValues,
    };
};
