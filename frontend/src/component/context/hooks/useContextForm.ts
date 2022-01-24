import { useEffect, useState } from 'react';
import useContextsApi from '../../../hooks/api/actions/useContextsApi/useContextsApi';

const useContextForm = (
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

    const validateNameUniqueness = async () => {
        try {
            await validateContextName(contextName);
        } catch (e: any) {
            if (e.toString().includes(NAME_EXISTS_ERROR)) {
                setErrors(prev => ({
                    ...prev,
                    name: 'A context field with that name already exist',
                }));
            }
        }
    };

    const validateName = () => {
        if (contextName.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        return true;
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
        validateNameUniqueness,
        validateName,
        setErrors,
        clearErrors,
        errors,
    };
};

export default useContextForm;
