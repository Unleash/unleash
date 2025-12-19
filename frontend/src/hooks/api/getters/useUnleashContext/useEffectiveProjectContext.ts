import type { SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import type { IUnleashContextOutput } from './useUnleashContext.js';
import useUnleashContext from './useUnleashContext.js';
import { fetcher } from '../useApiGetter/useApiGetter.js';
import { useUiFlag } from 'hooks/useUiFlag.js';

const useConditionalProjectContext = (
    projectId: string | undefined,
    options: SWRConfiguration,
): IUnleashContextOutput => {
    const flagEnabled = useUiFlag('projectContextFields');
    const path = formatApiPath(`api/admin/projects/${projectId}/context`);

    const getFetcher = () => fetcher(path, 'Project Context variables');

    const CONTEXT_CACHE_KEY = path;

    const { data, mutate, error, isValidating } = useConditionalSWR(
        !!projectId && flagEnabled,
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

// todo (projectContextFields): move this to its own API endpoint instead of
// merging on the front end after better learning the shape of the problem
export const useEffectiveProjectContext = (
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
