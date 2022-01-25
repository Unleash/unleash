import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFeatureApi from '../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import useQueryParams from '../../../../hooks/useQueryParams';
import { IFeatureViewParams } from '../../../../interfaces/params';

const useFeatureForm = (
    initialName = '',
    initialType = 'release',
    initialProject = 'default',
    initialDescription = ''
) => {
    const { projectId } = useParams<IFeatureViewParams>();
    const params = useQueryParams();
    const { validateFeatureToggleName } = useFeatureApi();
    const toggleQueryName = params.get('name');
    const [type, setType] = useState(initialType);
    const [name, setName] = useState(toggleQueryName || initialName);
    const [project, setProject] = useState(projectId || initialProject);
    const [description, setDescription] = useState(initialDescription);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setType(initialType);
    }, [initialType]);

    useEffect(() => {
        if (!toggleQueryName) setName(initialName);
        else setName(toggleQueryName);
    }, [initialName, toggleQueryName]);

    useEffect(() => {
        if (!projectId) setProject(initialProject);
        else setProject(projectId);
    }, [initialProject, projectId]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    const getTogglePayload = () => {
        return {
            type: type,
            name: name,
            projectId: project,
            description: description,
        };
    };

    const validateName = async (name: string) => {
        if (name.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        if (name.length > 0) {
            try {
                await validateFeatureToggleName(name);
            } catch (err: any) {
                setErrors(prev => ({
                    ...prev,
                    name:
                        err && err.message
                            ? err.message
                            : 'Could not check name',
                }));
            }
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
        getTogglePayload,
        validateName,
        clearErrors,
        errors,
    };
};

export default useFeatureForm;
