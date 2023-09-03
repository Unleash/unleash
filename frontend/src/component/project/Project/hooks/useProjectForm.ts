import { useEffect, useState } from 'react';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { formatUnknownError } from 'utils/formatUnknownError';

export type ProjectMode = 'open' | 'protected';
export const DEFAULT_PROJECT_STICKINESS = 'default';
const useProjectForm = (
    initialProjectId = '',
    initialProjectName = '',
    initialProjectDesc = '',
    initialProjectStickiness = DEFAULT_PROJECT_STICKINESS,
    initialProjectMode: ProjectMode = 'open',
    initialFeatureLimit = '',
    initialFeatureNamingPattern = '',
    initialFeatureNamingExample = '',
    initialFeatureNamingPrompt = ''
) => {
    const [projectId, setProjectId] = useState(initialProjectId);

    const [projectName, setProjectName] = useState(initialProjectName);
    const [projectDesc, setProjectDesc] = useState(initialProjectDesc);
    const [projectStickiness, setProjectStickiness] = useState<string>(
        initialProjectStickiness
    );
    const [projectMode, setProjectMode] =
        useState<ProjectMode>(initialProjectMode);
    const [featureLimit, setFeatureLimit] =
        useState<string>(initialFeatureLimit);
    const [featureNamingPattern, setFeatureNamingPattern] = useState(
        initialFeatureNamingPattern
    );
    const [featureNamingExample, setFeatureNamingExample] = useState(
        initialFeatureNamingExample
    );
    const [featureNamingPrompt, setFeatureNamingPrompt] = useState(
        initialFeatureNamingPrompt
    );
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
        setProjectMode(initialProjectMode);
    }, [initialProjectMode]);

    useEffect(() => {
        setFeatureLimit(initialFeatureLimit);
    }, [initialFeatureLimit]);

    useEffect(() => {
        setFeatureNamingPattern(initialFeatureNamingPattern);
    }, [initialFeatureNamingPattern]);

    useEffect(() => {
        setFeatureNamingExample(initialFeatureNamingExample);
    }, [initialFeatureNamingExample]);

    useEffect(() => {
        setFeatureNamingPrompt(initialFeatureNamingPrompt);
    }, [initialFeatureNamingPrompt]);

    useEffect(() => {
        setProjectStickiness(initialProjectStickiness);
    }, [initialProjectStickiness]);

    const getProjectPayload = () => {
        return {
            id: projectId,
            name: projectName,
            description: projectDesc,
            defaultStickiness: projectStickiness,
            featureLimit: getFeatureLimitAsNumber(),
            mode: projectMode,
            featureNaming: {
                pattern: featureNamingPattern,
                example: featureNamingExample,
                prompt: featureNamingPrompt,
            },
        };
    };

    const getFeatureLimitAsNumber = () => {
        if (featureLimit === '') {
            return undefined;
        }
        return Number(featureLimit);
    };

    const validateProjectId = async () => {
        if (projectId.length === 0) {
            setErrors(prev => ({ ...prev, id: 'Id can not be empty.' }));
            return false;
        }
        try {
            await validateId(getProjectPayload().id);
            return true;
        } catch (error: unknown) {
            setErrors(prev => ({ ...prev, id: formatUnknownError(error) }));
            return false;
        }
    };

    const validateName = () => {
        if (projectName.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
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
        projectStickiness,
        projectMode,
        featureLimit,
        featureNamingPattern,
        featureNamingExample,
        featureNamingPrompt,
        setFeatureNamingPattern,
        setFeatureNamingExample,
        setFeatureNamingPrompt,
        setProjectId,
        setProjectName,
        setProjectDesc,
        setProjectStickiness,
        setProjectMode,
        setFeatureLimit,
        getProjectPayload,
        validateName,
        validateProjectId,
        clearErrors,
        errors,
    };
};

export default useProjectForm;
