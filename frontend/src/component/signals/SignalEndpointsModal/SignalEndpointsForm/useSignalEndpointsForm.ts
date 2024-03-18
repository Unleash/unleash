import { URL_SAFE_BASIC } from '@server/util/constants';
import { useSignalEndpoints } from 'hooks/api/getters/useSignalEndpoints/useSignalEndpoints';
import type { ISignalEndpoint } from 'interfaces/signal';
import { useEffect, useState } from 'react';

enum ErrorField {
    NAME = 'name',
    TOKEN_NAME = 'tokenName',
}

const DEFAULT_SIGNAL_ENDPOINTS_FORM_ERRORS = {
    [ErrorField.NAME]: undefined,
    [ErrorField.TOKEN_NAME]: undefined,
};

export type SignalEndpointsFormErrors = Record<ErrorField, string | undefined>;

export enum TokenGeneration {
    LATER = 'later',
    NOW = 'now',
}

export const useSignalEndpointsForm = (signalEndpoint?: ISignalEndpoint) => {
    const { signalEndpoints } = useSignalEndpoints();

    const [enabled, setEnabled] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tokenGeneration, setTokenGeneration] = useState<TokenGeneration>(
        TokenGeneration.LATER,
    );
    const [tokenName, setTokenName] = useState('');

    const reloadForm = () => {
        setEnabled(signalEndpoint?.enabled ?? true);
        setName(signalEndpoint?.name || '');
        setDescription(signalEndpoint?.description || '');
        setTokenGeneration(TokenGeneration.LATER);
        setTokenName('');
        setValidated(false);
        setErrors(DEFAULT_SIGNAL_ENDPOINTS_FORM_ERRORS);
    };

    useEffect(() => {
        reloadForm();
    }, [signalEndpoint]);

    const [errors, setErrors] = useState<SignalEndpointsFormErrors>(
        DEFAULT_SIGNAL_ENDPOINTS_FORM_ERRORS,
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
        signalEndpoints?.some(
            ({ id, name }) => id !== signalEndpoint?.id && name === value,
        );

    const isNameInvalid = (value: string) => !URL_SAFE_BASIC.test(value);

    const validateName = (name: string) => {
        if (isEmpty(name)) {
            setError(ErrorField.NAME, 'Name is required.');
            return false;
        }

        if (isNameNotUnique(name)) {
            setError(ErrorField.NAME, 'Name must be unique.');
            return false;
        }

        if (isNameInvalid(name)) {
            setError(
                ErrorField.NAME,
                'Name must only contain alphanumeric lowercase characters, dashes and underscores.',
            );
            return false;
        }

        clearError(ErrorField.NAME);
        return true;
    };

    const validateTokenName = (
        tokenGeneration: TokenGeneration,
        tokenName: string,
    ) => {
        if (tokenGeneration === TokenGeneration.NOW && isEmpty(tokenName)) {
            setError(ErrorField.TOKEN_NAME, 'Token name is required.');
            return false;
        }

        clearError(ErrorField.TOKEN_NAME);
        return true;
    };

    const validate = () => {
        const validName = validateName(name);
        const validTokenName = validateTokenName(tokenGeneration, tokenName);

        setValidated(true);

        return validName && validTokenName;
    };

    return {
        enabled,
        setEnabled,
        name,
        setName,
        description,
        setDescription,
        tokenGeneration,
        setTokenGeneration,
        tokenName,
        setTokenName,
        errors,
        setErrors,
        validated,
        validateName,
        validateTokenName,
        validate,
        reloadForm,
    };
};
