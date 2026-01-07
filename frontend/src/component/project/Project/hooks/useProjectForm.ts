import { useEffect, useState } from 'react';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { ProjectMode } from './useProjectEnterpriseSettingsForm.js';
import useProjects from 'hooks/api/getters/useProjects/useProjects.js';

export const DEFAULT_PROJECT_STICKINESS = 'default';
const useProjectForm = (
    initialProjectId = '',
    initialProjectName = '',
    initialProjectDesc = '',
    initialProjectStickiness = DEFAULT_PROJECT_STICKINESS,
    initialFeatureLimit = '',
    initialProjectMode: ProjectMode = 'open',
    initialProjectEnvironments: Set<string> = new Set(),
    initialProjectChangeRequestConfiguration: Record<
        string,
        { requiredApprovals: number }
    > = {},
) => {
    const { projects } = useProjects();

    const { isEnterprise } = useUiConfig();
    const [projectId, setProjectId] = useState(initialProjectId);
    const [projectMode, setProjectMode] =
        useState<ProjectMode>(initialProjectMode);
    const [projectName, setProjectName] = useState(initialProjectName);
    const [projectDesc, setProjectDesc] = useState(initialProjectDesc);
    const [projectStickiness, setProjectStickiness] = useState<string>(
        initialProjectStickiness,
    );
    const [featureLimit, setFeatureLimit] =
        useState<string>(initialFeatureLimit);
    const [projectEnvironments, setProjectEnvironments] = useState<Set<string>>(
        initialProjectEnvironments,
    );
    const [
        projectChangeRequestConfiguration,
        setProjectChangeRequestConfiguration,
    ] = useState(initialProjectChangeRequestConfiguration);

    const updateProjectEnvironments = (newState: Set<string>) => {
        if (newState.size !== 0) {
            const filteredChangeRequestEnvs = Object.fromEntries(
                Object.entries(projectChangeRequestConfiguration).filter(
                    ([env]) => newState.has(env),
                ),
            );

            setProjectChangeRequestConfiguration(filteredChangeRequestEnvs);
        }

        setProjectEnvironments(newState);
    };

    const crConfig = {
        disableChangeRequests: (env: string) => {
            setProjectChangeRequestConfiguration((previousState) => {
                const { [env]: _, ...rest } = previousState;
                return rest;
            });
        },

        enableChangeRequests: (env: string, approvals: number) => {
            if (
                projectEnvironments.has(env) ||
                projectEnvironments.size === 0
            ) {
                setProjectChangeRequestConfiguration((previousState) => ({
                    ...previousState,
                    [env]: { requiredApprovals: approvals },
                }));
            }
        },
    };

    const [errors, setErrors] = useState({});

    const { validateId } = useProjectApi();

    useEffect(() => {
        setProjectId(initialProjectId);
    }, [initialProjectId]);

    useEffect(() => {
        setProjectName(initialProjectName);
    }, [initialProjectName]);

    useEffect(() => {
        setProjectDesc(initialProjectDesc);
    }, [initialProjectDesc]);

    useEffect(() => {
        setFeatureLimit(initialFeatureLimit);
    }, [initialFeatureLimit]);

    useEffect(() => {
        setProjectStickiness(initialProjectStickiness);
    }, [initialProjectStickiness]);

    useEffect(() => {
        setProjectMode(initialProjectMode);
    }, [initialProjectMode]);

    const getCreateProjectPayload = (options?: {
        omitId?: boolean;
        includeChangeRequestConfig?: boolean;
    }) => {
        const environmentsPayload =
            projectEnvironments.size > 0
                ? { environments: [...projectEnvironments] }
                : {};

        const changeRequestEnvironments = Object.entries(
            projectChangeRequestConfiguration,
        ).map(([env, { requiredApprovals }]) => ({
            name: env,
            requiredApprovals,
        }));

        const ossPayload = {
            ...(options?.omitId ? {} : { id: projectId }),
            name: projectName,
            description: projectDesc,
            defaultStickiness: projectStickiness,
            ...environmentsPayload,
        };

        return isEnterprise()
            ? {
                  ...ossPayload,
                  mode: projectMode,
                  ...(options?.includeChangeRequestConfig
                      ? { changeRequestEnvironments }
                      : {}),
              }
            : ossPayload;
    };

    const getEditProjectPayload = () => {
        return {
            id: projectId,
            name: projectName,
            description: projectDesc,
            defaultStickiness: projectStickiness,
            featureLimit: getFeatureLimitAsNumber(),
        };
    };

    const getFeatureLimitAsNumber = () => {
        if (featureLimit === '') {
            return null;
        }
        return Number(featureLimit);
    };

    const validateProjectId = async () => {
        if (projectId.length === 0) {
            setErrors((prev) => ({ ...prev, id: 'Id can not be empty.' }));
            return false;
        }
        try {
            await validateId(getCreateProjectPayload().id);
            return true;
        } catch (error: unknown) {
            setErrors((prev) => ({ ...prev, id: formatUnknownError(error) }));
            return false;
        }
    };

    const validateName = () => {
        if (projectName.trim().length === 0) {
            setErrors((prev) => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }

        if (
            projectName !== initialProjectName &&
            projects.some(({ name }) => name === projectName)
        ) {
            setErrors((prev) => ({
                ...prev,
                name: 'This name is already taken by a different project.',
            }));
            return false;
        }

        return true;
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        projectId,
        projectName,
        projectDesc,
        projectMode,
        projectStickiness,
        featureLimit,
        projectEnvironments,
        projectChangeRequestConfiguration,
        setProjectId,
        setProjectName,
        setProjectDesc,
        setProjectStickiness,
        setFeatureLimit,
        setProjectMode,
        setProjectEnvironments: updateProjectEnvironments,
        updateProjectChangeRequestConfig: crConfig,
        getCreateProjectPayload,
        getEditProjectPayload,
        validateName,
        validateProjectId,
        clearErrors,
        errors,
    };
};

export default useProjectForm;
