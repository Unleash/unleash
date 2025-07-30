import { useEffect, useState } from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import type { IApiTokenCreate } from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import { TokenType } from 'interfaces/token';
import {
    CREATE_FRONTEND_API_TOKEN,
    CREATE_CLIENT_API_TOKEN,
    CREATE_PROJECT_API_TOKEN,
} from '@server/types/permissions';
import { useHasRootAccess } from 'hooks/useHasAccess';
import type { SelectOption } from './TokenTypeSelector/TokenTypeSelector.jsx';

export type ApiTokenFormErrorType = 'tokenName' | 'projects';
export const useApiTokenForm = (project?: string) => {
    const { environments } = useEnvironments();
    const initialEnvironment = environments?.find((e) => e.enabled)?.name;

    const hasCreateProjectTokenPermission = useHasRootAccess(
        CREATE_PROJECT_API_TOKEN,
        project,
    );

    const apiTokenTypes: SelectOption[] = [
        {
            key: TokenType.CLIENT,
            label: 'Backend SDK',
            title: 'Creates a backend token to connect a backend SDK or Unleash Edge',
            enabled:
                useHasRootAccess(CREATE_CLIENT_API_TOKEN) ||
                hasCreateProjectTokenPermission,
        },
        {
            key: TokenType.FRONTEND,
            label: 'Frontend SDK',
            title: 'Creates a frontend token to connect a frontend SDK',
            enabled:
                useHasRootAccess(CREATE_FRONTEND_API_TOKEN) ||
                hasCreateProjectTokenPermission,
        },
    ];

    const firstAccessibleType = apiTokenTypes.find((t) => t.enabled)?.key;

    const [tokenName, setTokenName] = useState('');
    const [type, setType] = useState(firstAccessibleType || TokenType.CLIENT);
    const [projects, setProjects] = useState<string[]>([
        project ? project : '*',
    ]);
    const [memorizedProjects, setMemorizedProjects] =
        useState<string[]>(projects);
    const [environment, setEnvironment] = useState<string>();
    const [errors, setErrors] = useState<
        Partial<Record<ApiTokenFormErrorType, string>>
    >({});

    useEffect(() => {
        setEnvironment(type === 'ADMIN' ? '*' : initialEnvironment);
    }, [type, initialEnvironment]);

    const setTokenType = (value: TokenType) => {
        if (value === 'ADMIN') {
            setType(TokenType.ADMIN);
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
        tokenName,
        type,
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
        type,
        apiTokenTypes,
        projects,
        environment,
        setTokenName,
        setTokenType,
        setProjects,
        setEnvironment,
        getApiTokenPayload,
        isValid,
        clearErrors,
        errors,
    };
};
