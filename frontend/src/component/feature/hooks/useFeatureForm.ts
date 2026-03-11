import { useEffect, useRef, useState } from 'react';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useQueryParams from 'hooks/useQueryParams';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { ITag } from 'interfaces/tags';
import type {
    CreateFeatureSchema,
    CreateFeatureSchemaType,
    FeatureTypeSchema,
} from 'openapi';

export type FeatureFormInitialData = Partial<{
    name: string;
    type: CreateFeatureSchemaType;
    project: string;
    description: string;
    impressionData: boolean;
    tags: Set<ITag>;
    targetDate: string | null;
}>;

const computeTargetDate = (
    featureType: CreateFeatureSchemaType | undefined,
    featureTypes: FeatureTypeSchema[],
): string | null => {
    const match = featureTypes.find((t) => t.id === featureType);
    if (!match?.lifetimeDays) return null;
    const date = new Date();
    date.setDate(date.getDate() + match.lifetimeDays);
    return date.toISOString();
};

const useFeatureForm = (
    {
        name: initialName = '',
        type: initialType = 'release',
        project: initialProject = 'default',
        description: initialDescription = '',
        impressionData: initialImpressionData = false,
        tags: initialTags = new Set(),
        targetDate: initialTargetDate = undefined,
    }: FeatureFormInitialData,
    featureTypes: FeatureTypeSchema[] = [],
) => {
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
    const [targetDate, setTargetDateState] = useState<string | null>(
        initialTargetDate !== undefined
            ? initialTargetDate
            : computeTargetDate(initialType, featureTypes),
    );
    // Track whether the user has manually overridden the auto-calculated date
    const targetDateManuallySet = useRef(false);
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

    // When the flag type changes, recalculate targetDate unless the user manually set it
    useEffect(() => {
        if (!targetDateManuallySet.current) {
            setTargetDateState(computeTargetDate(type, featureTypes));
        }
    }, [type, featureTypes]);

    const setTargetDate = (date: string | null) => {
        targetDateManuallySet.current = true;
        setTargetDateState(date);
    };

    const resetTargetDate = () => {
        targetDateManuallySet.current = false;
        setTargetDateState(computeTargetDate(type, featureTypes));
    };

    const getTogglePayload = (): CreateFeatureSchema => {
        const tagsPayload = tags.size > 0 ? { tags: Array.from(tags) } : {};
        return {
            type,
            name,
            description,
            impressionData,
            targetDate: targetDate ?? undefined,
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
        targetDate,
        setTargetDate,
        resetTargetDate,
        getTogglePayload,
        validateToggleName,
        clearErrors,
        errors,
    };
};

export default useFeatureForm;
