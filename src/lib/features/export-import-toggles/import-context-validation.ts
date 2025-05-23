import type { IContextFieldDto } from '../context/context-field-store-type.js';

export const isValidField = (
    importedField: IContextFieldDto,
    existingFields: IContextFieldDto[],
): boolean => {
    const matchingExistingField = existingFields.find(
        (field) => field.name === importedField.name,
    );
    if (!matchingExistingField) {
        return true;
    }
    return (importedField.legalValues || []).every((value) =>
        (matchingExistingField.legalValues || []).find(
            (v) => v.value === value.value,
        ),
    );
};
