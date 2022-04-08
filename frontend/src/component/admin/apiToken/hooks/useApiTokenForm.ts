import { useEffect, useState } from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { IApiTokenCreate } from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';

export type ApiTokenFormErrorType = 'username' | 'projects';

export const useApiTokenForm = () => {
    const { environments } = useEnvironments();
    const initialEnvironment = environments?.find(e => e.enabled)?.name;

    const [username, setUsername] = useState('');
    const [type, setType] = useState('CLIENT');
    const [projects, setProjects] = useState<string[]>(['*']);
    const [memorizedProjects, setMemorizedProjects] =
        useState<string[]>(projects);
    const [environment, setEnvironment] = useState<string>();
    const [errors, setErrors] = useState<
        Partial<Record<ApiTokenFormErrorType, string>>
    >({});

    useEffect(() => {
        setEnvironment(type === 'ADMIN' ? '*' : initialEnvironment);
    }, [type, initialEnvironment]);

    const setTokenType = (value: string) => {
        if (value === 'ADMIN') {
            setType(value);
            setMemorizedProjects(projects);
            setProjects(['*']);
            setEnvironment('*');
        } else {
            setType(value);
            setProjects(memorizedProjects);
            setEnvironment(initialEnvironment);
        }
    };

    const getApiTokenPayload = (): IApiTokenCreate => ({
        username,
        type,
        environment,
        projects,
    });

    const isValid = () => {
        const newErrors: Partial<Record<ApiTokenFormErrorType, string>> = {};
        if (!username) {
            newErrors['username'] = 'Username is required';
        }
        if (projects.length === 0) {
            newErrors['projects'] = 'At least one project is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearErrors = (error?: ApiTokenFormErrorType) => {
        if (error) {
            const newErrors = { ...errors };
            delete newErrors[error];
            setErrors(newErrors);
        } else {
            setErrors({});
        }
    };

    return {
        username,
        type,
        projects,
        environment,
        setUsername,
        setTokenType,
        setProjects,
        setEnvironment,
        getApiTokenPayload,
        isValid,
        clearErrors,
        errors,
    };
};
