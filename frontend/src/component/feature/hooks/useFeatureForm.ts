import { useEffect, useState } from 'react';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useQueryParams from 'hooks/useQueryParams';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { ITag } from 'interfaces/tags';
import type { CreateFeatureSchema, CreateFeatureSchemaType } from 'openapi';
import { useOptionalPathParamWithFallback } from 'hooks/useOptionalPathParamWithFallback';

const useFeatureForm = (
    initialName: string = '',
    initialType: CreateFeatureSchemaType = 'release',
    initialProject: string = 'default',
    initialDescription: string = '',
    initialImpressionData: boolean = false,
    fallbackProjectId?: string,
) => {
    console.log('fallbackProjectId', fallbackProjectId);
    const projectId = useOptionalPathParamWithFallback(
        'projectId',
        fallbackProjectId,
    );
    const params = useQueryParams();
    const { validateFeatureToggleName } = useFeatureApi();
    const toggleQueryName = params.get('name');
    const [type, setType] = useState(initialType);
    const [tags, setTags] = useState<Set<ITag>>(new Set());
    const [name, setName] = useState(toggleQueryName || initialName);
    const [project, setProject] = useState(projectId || initialProject);
    const [description, setDescription] = useState(initialDescription);
    const [impressionData, setImpressionData] = useState<boolean>(
        initialImpressionData,
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

    const getTogglePayload = (): CreateFeatureSchema => {
        const tagsPayload = tags.size > 0 ? { tags: Array.from(tags) } : {};
        return {
            type,
            name,
            description,
            impressionData,
            ...tagsPayload,
        };
    };

    const validateToggleName = async () => {
        if (name.length === 0) {
            setErrors((prev) => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        try {
            await validateFeatureToggleName(name, project);
            return true;
        } catch (error: unknown) {
            setErrors((prev) => ({ ...prev, name: formatUnknownError(error) }));
            return false;
        }
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        type,
        setType,
        tags,
        setTags,
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
