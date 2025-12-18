import type { SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import type { IUnleashContextOutput } from './useUnleashContext';
import useUnleashContext from './useUnleashContext';
import { fetcher } from '../useApiGetter/useApiGetter.js';

const useConditionalProjectContext = (
    projectId: string | undefined,
    options: SWRConfiguration,
): IUnleashContextOutput => {
    const path = formatApiPath(`api/admin/projects/${projectId}/context`);

    const getFetcher = () => fetcher(path, 'Project Context variables');

    const CONTEXT_CACHE_KEY = path;

    const { data, mutate, error, isValidating } = useConditionalSWR(
        !!projectId,
        [],
        CONTEXT_CACHE_KEY,
        getFetcher,
        options,
    );

    return {
        context: data || [],
        error,
        loading: isValidating && !error && !data,
        refetchUnleashContext: mutate,
    };
};

export const useCombinedGlobalAndProjectContext = (
    projectId: string | undefined,
    options: SWRConfiguration = {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
    },
): IUnleashContextOutput => {
    const globalContext = useUnleashContext(options);
    const projectContext = useConditionalProjectContext(projectId, options);

    if (!projectId) {
        return globalContext;
    }

    const combinedContextValues = globalContext.context
        .concat(projectContext.context)
        .toSorted((a, b) => a.name.localeCompare(b.name));

    return {
        context: combinedContextValues,
        refetchUnleashContext: () => {
            globalContext.refetchUnleashContext();
            projectContext.refetchUnleashContext();
        },
        loading: globalContext.loading || projectContext.loading,
        error: globalContext.error ?? projectContext.error,
    };
};
