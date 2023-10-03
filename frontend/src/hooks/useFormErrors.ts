import { useState, useCallback } from 'react';
import produce from 'immer';

export interface IFormErrors {
    // Get the error message for a field name, if any.
    getFormError(field: string): string | undefined;

    // Set an error message for a field name.
    setFormError(field: string, message: string): void;

    // Remove an existing error for a field name.
    removeFormError(field: string): void;

    // Check if there are any errors.
    hasFormErrors(): boolean;
}

export const useFormErrors = (): IFormErrors => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getFormError = useCallback(
        (field: string): string | undefined => errors[field],
        [errors]
    );

    const setFormError = useCallback(
        (field: string, message: string): void => {
            setErrors(
                produce(draft => {
                    draft[field] = message;
                })
            );
        },
        [setErrors]
    );

    const removeFormError = useCallback(
        (field: string): void => {
            setErrors(
                produce(draft => {
                    delete draft[field];
                })
            );
        },
        [setErrors]
    );

    const hasFormErrors = useCallback(
        (): boolean => Object.values(errors).some(Boolean),
        [errors]
    );

    return {
        getFormError,
        setFormError,
        removeFormError,
        hasFormErrors,
    };
};
