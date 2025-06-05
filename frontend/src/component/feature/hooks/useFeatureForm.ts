import { useEffect, useState } from 'react';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useQueryParams from 'hooks/useQueryParams';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { ITag } from 'interfaces/tags';
import type { CreateFeatureSchema, CreateFeatureSchemaType } from 'openapi';

export type FeatureFormInitialData = Partial<{
    name: string;
    type: CreateFeatureSchemaType;
    project: string;
    description: string;
    impressionData: boolean;
    tags: Set<ITag>;
}>;

const useFeatureForm = ({
    name: initialName = '',
    type: initialType = 'release',
    project: initialProject = 'default',
    description: initialDescription = '',
    impressionData: initialImpressionData = false,
    tags: initialTags = new Set(),
}: FeatureFormInitialData) => {
    const projectId = useRequiredPathParam('projectId');
    const params = useQueryParams();
    const { validateFeatureToggleName } = useFeatureApi();
    const toggleQueryName = params.get('name');
    const [type, setType] = useState(initialType);
    const [tags, setTags] = useState<Set<ITag>>(initialTags);
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
