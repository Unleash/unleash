import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFeatureApi from '../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import useQueryParams from '../../../hooks/useQueryParams';
import { IFeatureViewParams } from '../../../interfaces/params';

const useFeatureForm = (
    initialName = '',
    initialType = 'release',
    initialProject = 'default',
    initialDescription = '',
    initialImpressionData = false
) => {
    const { projectId } = useParams<IFeatureViewParams>();
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

    const NAME_EXISTS_ERROR = 'Error: A toggle with that name already exists';

    const validateToggleName = async () => {
        if (name.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        try {
            await validateFeatureToggleName(name);
            return true;
        } catch (e: any) {
            if (e.toString().includes(NAME_EXISTS_ERROR)) {
                setErrors(prev => ({
                    ...prev,
                    name: 'A feature with this name already exists',
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    name: e.toString(),
                }));
            }
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
