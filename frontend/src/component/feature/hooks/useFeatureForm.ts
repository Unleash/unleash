import { useEffect, useState } from 'react';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useQueryParams from 'hooks/useQueryParams';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { formatUnknownError } from 'utils/formatUnknownError';

const useFeatureForm = (
    initialName = '',
    initialType = 'release',
    initialProject = 'default',
    initialDescription = '',
    initialImpressionData = false
) => {
    const projectId = useRequiredPathParam('projectId');
    const params = useQueryParams();
    const { validateFeatureToggleName } = useFeatureApi();
    const toggleQueryName = params.get('name');
    const [type, setType] = useState(initialType);
    const [name, setName] = useState(toggleQueryName || initialName);
    const [project, setProject] = useState(projectId || initialProject);
    const [description, setDescription] = useState(initialDescription);
    const [impressionData, setImpressionData] = useState<boolean>(
        initialImpressionData
    );
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setType(initialType);
    }, [initialType]);

    useEffect(() => {
        if (!name) {
            setName(toggleQueryName || initialName);
        }
    }, [name, initialName, toggleQueryName]);

    useEffect(() => {
        if (!projectId) setProject(initialProject);
        else setProject(projectId);
    }, [initialProject, projectId]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    useEffect(() => {
        setImpressionData(initialImpressionData);
    }, [initialImpressionData]);

    const getTogglePayload = () => {
        return {
            type,
            name,
            description,
            impressionData,
        };
    };

    const validateToggleName = async () => {
        if (name.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        try {
            await validateFeatureToggleName(name);
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
        type,
        setType,
        name,
        setName,
        project,
        setProject,
        description,
        setDescription,
        impressionData,
        setImpressionData,
        getTogglePayload,
        validateToggleName,
        clearErrors,
        errors,
    };
};

export default useFeatureForm;
