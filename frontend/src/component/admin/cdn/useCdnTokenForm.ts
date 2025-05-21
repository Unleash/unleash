import { useState } from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';

export type ApiTokenFormErrorType = 'tokenName' | 'projects';
export const useCdnTokenForm = (project?: string) => {
    const { environments } = useEnvironments();

    const [tokenName, setTokenName] = useState('');
    const [projects, setProjects] = useState<string[]>([
        project ? project : '*',
    ]);
    const [memorizedProjects, setMemorizedProjects] =
        useState<string[]>(projects);
    const [environment, setEnvironment] = useState<string>();
    const [errors, setErrors] = useState<
        Partial<Record<ApiTokenFormErrorType, string>>
    >({});

    const getApiTokenPayload = () => ({
        // FIXME: payload
        tokenName,
        environment,
        projects,
    });

    const isValid = () => {
        const newErrors: Partial<Record<ApiTokenFormErrorType, string>> = {};
        if (!tokenName) {
            newErrors.tokenName = 'Token name is required';
        }
        if (projects.length === 0) {
            newErrors.projects = 'At least one project is required';
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
        tokenName,
        projects,
        environment,
        setTokenName,
        setProjects,
        setEnvironment,
        getApiTokenPayload,
        isValid,
        clearErrors,
        errors,
    };
};
