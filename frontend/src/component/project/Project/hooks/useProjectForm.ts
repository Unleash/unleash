import { useEffect, useState } from 'react';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useDefaultProjectStickiness } from '../../../../hooks/useDefaultProjectStickiness';

const useProjectForm = (
    initialProjectId = '',
    initialProjectName = '',
    initialProjectDesc = '',
    initialProjectStickiness = 'default'
) => {
    const [projectId, setProjectId] = useState(initialProjectId);
    const { defaultStickiness } = useDefaultProjectStickiness(projectId);

    const [projectName, setProjectName] = useState(initialProjectName);
    const [projectDesc, setProjectDesc] = useState(initialProjectDesc);
    const [projectStickiness, setProjectStickiness] = useState(
        defaultStickiness || initialProjectStickiness
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

    const getProjectPayload = () => {
        return {
            id: projectId,
            name: projectName,
            description: projectDesc,
            projectStickiness,
        };
    };

    const validateProjectId = async () => {
        if (projectId.length === 0) {
            setErrors(prev => ({ ...prev, id: 'Id can not be empty.' }));
            return false;
        }
        try {
            await validateId(getProjectPayload());
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
        setProjectId,
        setProjectName,
        setProjectDesc,
        setProjectStickiness,
        getProjectPayload,
        validateName,
        validateProjectId,
        clearErrors,
        errors,
    };
};

export default useProjectForm;
