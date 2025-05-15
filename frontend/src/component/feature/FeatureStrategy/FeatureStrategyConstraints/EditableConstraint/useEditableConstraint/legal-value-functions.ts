import type { ILegalValue } from 'interfaces/context';
import { difference } from './set-functions.js';

export const getDeletedLegalValues = (
    allLegalValues: ILegalValue[],
    selectedLegalValues: string[],
): Set<string> => {
    const currentLegalValues = new Set(
        allLegalValues.map(({ value }) => value),
    );
    const deletedValues = difference(selectedLegalValues, currentLegalValues);

    return deletedValues;
};

export const getInvalidLegalValues = (
    validate: (value: string) => boolean,
    allLegalValues: ILegalValue[],
): Set<string> => {
    return new Set(
        allLegalValues
            .filter(({ value }) => !validate(value))
            .map(({ value }) => value),
    );
};
