import { useEffect, useState } from 'react';
import useContextsApi from '../../../hooks/api/actions/useContextsApi/useContextsApi';

export const useContextForm = (
    initialcontextName = '',
    initialcontextDesc = '',
    initialLegalValues = [] as string[],
    initialStickiness = false
) => {
    const [contextName, setContextName] = useState(initialcontextName);
    const [contextDesc, setContextDesc] = useState(initialcontextDesc);
    const [legalValues, setLegalValues] = useState(initialLegalValues);
    const [stickiness, setStickiness] = useState(initialStickiness);
    const [errors, setErrors] = useState({});
    const { validateContextName } = useContextsApi();

    useEffect(() => {
        setContextName(initialcontextName);
    }, [initialcontextName]);

    useEffect(() => {
        setContextDesc(initialcontextDesc);
    }, [initialcontextDesc]);

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

    const NAME_EXISTS_ERROR = 'A context field with that name already exist';

    const validateContext = async () => {
        if (contextName.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        try {
            await validateContextName(contextName);
            return true;
        } catch (e: any) {
            if (e.toString().includes(NAME_EXISTS_ERROR)) {
                setErrors(prev => ({
                    ...prev,
                    name: 'A context field with that name already exist',
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    name: e.toString(),
                }));
            }
            return false;
        }
    };

    const clearErrors = () => {
        setErrors({});
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
