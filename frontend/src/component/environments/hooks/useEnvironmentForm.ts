import { useEffect, useState } from 'react';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import { formatUnknownError } from 'utils/formatUnknownError';

const useEnvironmentForm = (initialName = '', initialType = 'development') => {
    const [name, setName] = useState(initialName);
    const [type, setType] = useState(initialType);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setType(initialType);
    }, [initialType]);

    const { validateEnvName } = useEnvironmentApi();

    const getEnvPayload = () => {
        return {
            name,
            type,
        };
    };

    const validateEnvironmentName = async () => {
        if (name.length === 0) {
            setErrors(prev => ({
                ...prev,
                name: 'Environment name can not be empty',
            }));
            return false;
        }

        try {
            await validateEnvName(name);
            return true;
        } catch (error: unknown) {
            setErrors(prev => ({ ...prev, name: formatUnknownError(error) }));
            return false;
        }
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        name,
        setName,
        type,
        setType,
        getEnvPayload,
        validateEnvironmentName,
        clearErrors,
        errors,
    };
};

export default useEnvironmentForm;
