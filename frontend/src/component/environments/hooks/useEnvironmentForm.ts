import { useEffect, useState } from 'react';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';

const useEnvironmentForm = (initialName = '', initialType = 'development') => {
    const NAME_EXISTS_ERROR = 'Error: Environment';
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
        } catch (e: any) {
            if (e.toString().includes(NAME_EXISTS_ERROR)) {
                setErrors(prev => ({
                    ...prev,
                    name: 'Name already exists',
                }));
            }
            return false;
        }
        return true;
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
