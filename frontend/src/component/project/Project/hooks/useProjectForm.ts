import { useEffect, useState } from 'react';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ProjectMode } from './useProjectEnterpriseSettingsForm';

export const DEFAULT_PROJECT_STICKINESS = 'default';
const useProjectForm = (
    initialProjectId = '',
    initialProjectName = '',
    initialProjectDesc = '',
    initialProjectStickiness = DEFAULT_PROJECT_STICKINESS,
    initialFeatureLimit = '',
    initialProjectMode: ProjectMode = 'open',
) => {
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

    const getCreateProjectPayload = () => {
        return isEnterprise()
            ? {
                  id: projectId,
                  name: projectName,
                  description: projectDesc,
                  defaultStickiness: projectStickiness,
                  mode: projectMode,
              }
            : {
                  id: projectId,
                  name: projectName,
                  description: projectDesc,
                  defaultStickiness: projectStickiness,
              };
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
        if (projectName.length === 0) {
            setErrors((prev) => ({ ...prev, name: 'Name can not be empty.' }));
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
        setProjectId,
        setProjectName,
        setProjectDesc,
        setProjectStickiness,
        setFeatureLimit,
        setProjectMode,
        getCreateProjectPayload,
        getEditProjectPayload,
        validateName,
        validateProjectId,
        clearErrors,
        errors,
    };
};

export default useProjectForm;
