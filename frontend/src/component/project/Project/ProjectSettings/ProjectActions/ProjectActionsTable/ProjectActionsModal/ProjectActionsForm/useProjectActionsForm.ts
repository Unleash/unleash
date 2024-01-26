import { useActions } from 'hooks/api/getters/useActions/useActions';
import { IActionSet } from 'interfaces/action';
import { useEffect, useState } from 'react';

enum ErrorField {
    NAME = 'name',
    TRIGGER = 'trigger',
    ACTOR = 'actor',
}

const DEFAULT_PROJECT_ACTIONS_FORM_ERRORS = {
    [ErrorField.NAME]: undefined,
    [ErrorField.TRIGGER]: undefined,
    [ErrorField.ACTOR]: undefined,
};

export type ProjectActionsFormErrors = Record<ErrorField, string | undefined>;

export const useProjectActionsForm = (action?: IActionSet) => {
    const { actions } = useActions();

    const [enabled, setEnabled] = useState(false);
    const [name, setName] = useState('');

    const reloadForm = () => {
        setEnabled(action?.enabled ?? true);
        setName(action?.name || '');
        setValidated(false);
        setErrors(DEFAULT_PROJECT_ACTIONS_FORM_ERRORS);
    };

    useEffect(() => {
        reloadForm();
    }, [action]);

    const [errors, setErrors] = useState<ProjectActionsFormErrors>(
        DEFAULT_PROJECT_ACTIONS_FORM_ERRORS,
    );
    const [validated, setValidated] = useState(false);

    const clearError = (field: ErrorField) => {
        setErrors((errors) => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors((errors) => ({ ...errors, [field]: error }));
    };

    const isEmpty = (value: string) => !value.length;

    const isNameNotUnique = (value: string) =>
        actions?.some(({ id, name }) => id !== action?.id && name === value);

    const validateName = (name: string) => {
        if (isEmpty(name)) {
            setError(ErrorField.NAME, 'Name is required.');
            return false;
        }

        if (isNameNotUnique(name)) {
            setError(ErrorField.NAME, 'Name must be unique.');
            return false;
        }

        clearError(ErrorField.NAME);
        return true;
    };

    const validate = () => {
        const validName = validateName(name);

        setValidated(true);

        return validName;
    };

    return {
        enabled,
        setEnabled,
        name,
        setName,
        errors,
        setErrors,
        validated,
        validateName,
        validate,
        reloadForm,
    };
};
