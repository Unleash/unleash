import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';

export type ContextFieldValue = {
    contextName: string;
    value: string;
};

export const useProjectContextFieldValues = (project: string) => {
    const PATH = formatApiPath(
        `api/admin/search/features/context-field-values?project=${encodeURIComponent(project)}`,
    );
    const { data, refetch, error } = useApiGetter<ContextFieldValue[]>(
        project ? PATH : null,
        () => fetcher(PATH, 'Context field values'),
    );

    return { contextFieldValues: data || [], refetch, error };
};
