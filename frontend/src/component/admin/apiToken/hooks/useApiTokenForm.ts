import { useEffect, useState } from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';

export const useApiTokenForm = () => {
    const { environments } = useEnvironments();
    const initialEnvironment = environments?.find(e => e.enabled)?.name;

    const [username, setUsername] = useState('');
    const [type, setType] = useState('CLIENT');
    const [project, setProject] = useState('*');
    const [environment, setEnvironment] = useState<string>();
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setEnvironment(type === 'ADMIN' ? '*' : initialEnvironment);
    }, [type, initialEnvironment]);

    const setTokenType = (value: string) => {
        if (value === 'ADMIN') {
            setType(value);
            setProject('*');
            setEnvironment('*');
        } else {
            setType(value);
            setEnvironment(initialEnvironment);
        }
    };

    const getApiTokenPayload = () => {
        return {
            username: username,
            type: type,
            project: project,
            environment: environment,
        };
    };

    const isValid = () => {
        if (!username) {
            setErrors({ username: 'Username is required.' });
            return false;
        } else {
            setErrors({});
            return true;
        }
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        username,
        type,
        project,
        environment,
        setUsername,
        setTokenType,
        setProject,
        setEnvironment,
        getApiTokenPayload,
        isValid,
        clearErrors,
        errors,
    };
};
