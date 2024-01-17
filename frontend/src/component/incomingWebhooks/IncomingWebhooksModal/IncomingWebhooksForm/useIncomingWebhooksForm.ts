import { useIncomingWebhooks } from 'hooks/api/getters/useIncomingWebhooks/useIncomingWebhooks';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';
import { useEffect, useState } from 'react';

const INCOMING_WEBHOOK_NAME_REGEX = /^[A-Za-z0-9\-_]*$/;

enum ErrorField {
    NAME = 'name',
    TOKEN_NAME = 'tokenName',
}

const DEFAULT_INCOMING_WEBHOOKS_FORM_ERRORS = {
    [ErrorField.NAME]: undefined,
    [ErrorField.TOKEN_NAME]: undefined,
};

export type IncomingWebhooksFormErrors = Record<ErrorField, string | undefined>;

export enum TokenGeneration {
    LATER = 'later',
    NOW = 'now',
}

export const useIncomingWebhooksForm = (incomingWebhook?: IIncomingWebhook) => {
    const { incomingWebhooks } = useIncomingWebhooks();

    const [enabled, setEnabled] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tokenGeneration, setTokenGeneration] = useState<TokenGeneration>(
        TokenGeneration.LATER,
    );
    const [tokenName, setTokenName] = useState('');

    const reloadForm = () => {
        setEnabled(incomingWebhook?.enabled || true);
        setName(incomingWebhook?.name || '');
        setDescription(incomingWebhook?.description || '');
        setTokenGeneration(TokenGeneration.LATER);
        setTokenName('');
        setValidated(false);
        setErrors(DEFAULT_INCOMING_WEBHOOKS_FORM_ERRORS);
    };

    useEffect(() => {
        reloadForm();
    }, [incomingWebhook]);

    const [errors, setErrors] = useState<IncomingWebhooksFormErrors>(
        DEFAULT_INCOMING_WEBHOOKS_FORM_ERRORS,
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
        incomingWebhooks?.some(
            ({ id, name }) => id !== incomingWebhook?.id && name === value,
        );

    const isNameInvalid = (value: string) =>
        !INCOMING_WEBHOOK_NAME_REGEX.test(value);

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
                'Name must only contain alphanumeric characters, dashes and underscores.',
            );
            return false;
        }

        clearError(ErrorField.NAME);
        return true;
    };

    const validateTokenName = (tokenName: string) => {
        if (tokenGeneration === TokenGeneration.NOW && isEmpty(tokenName)) {
            setError(ErrorField.TOKEN_NAME, 'Token name is required.');
            return false;
        }

        clearError(ErrorField.TOKEN_NAME);
        return true;
    };

    const validate = () => {
        const validName = validateName(name);
        const validTokenName = validateTokenName(tokenName);

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
