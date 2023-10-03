import { useEffect, useState } from 'react';
import useContextsApi from 'hooks/api/actions/useContextsApi/useContextsApi';
import { ILegalValue } from 'interfaces/context';
import { formatUnknownError } from 'utils/formatUnknownError';

export const useContextForm = (
    initialContextName = '',
    initialContextDesc = '',
    initialLegalValues = [] as ILegalValue[],
    initialStickiness = false
) => {
    const [contextName, setContextName] = useState(initialContextName);
    const [contextDesc, setContextDesc] = useState(initialContextDesc);
    const [legalValues, setLegalValues] = useState(initialLegalValues);
    const [stickiness, setStickiness] = useState(initialStickiness);
    const [errors, setErrors] = useState({});
    const { validateContextName } = useContextsApi();

    useEffect(() => {
        setContextName(initialContextName);
    }, [initialContextName]);

    useEffect(() => {
        setContextDesc(initialContextDesc);
    }, [initialContextDesc]);

    useEffect(() => {
        setLegalValues(initialLegalValues);
        // eslint-disable-next-line
    }, [initialLegalValues.length]);

    useEffect(() => {
        setStickiness(initialStickiness);
    }, [initialStickiness]);

    const getContextPayload = () => {
        return {
            name: contextName,
            description: contextDesc,
            legalValues,
            stickiness,
        };
    };

    const validateContext = async () => {
        if (contextName.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        try {
            await validateContextName(contextName);
            return true;
        } catch (error: unknown) {
            setErrors(prev => ({ ...prev, name: formatUnknownError(error) }));
            return false;
        }
    };

    const clearErrors = (key?: string) => {
        if (key) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        } else {
            setErrors({});
        }
    };

    return {
        contextName,
        contextDesc,
        legalValues,
        stickiness,
        setContextName,
        setContextDesc,
        setLegalValues,
        setStickiness,
        getContextPayload,
        validateContext,
        setErrors,
        clearErrors,
        errors,
    };
};
