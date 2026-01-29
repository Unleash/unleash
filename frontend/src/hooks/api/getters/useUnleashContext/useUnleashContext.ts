import useSWR, { type SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { IUnleashContextDefinition } from 'interfaces/context';
import { useUiFlag } from 'hooks/useUiFlag.js';

export interface IUnleashContextOutput {
    context: IUnleashContextDefinition[];
    refetchUnleashContext: () => void;
    loading: boolean;
    error?: Error;
}

type Query =
    | { mode: 'root-only' }
    | { mode: 'all' }
    | { mode: 'project-only'; projectId: string }
    | { mode: 'assignable-in-project'; projectId: string };

const uriFromQuery = (query: Query) => {
    switch (query.mode) {
        case 'root-only':
            return 'api/admin/context';
        case 'all':
            return 'api/admin/context?include=project';
        case 'project-only':
            return `api/admin/projects/${query.projectId}/context`;
        case 'assignable-in-project':
            return `api/admin/projects/${query.projectId}/context?include=root`;
    }
};

const useUnleashContext = (
    query: Query,
    options: SWRConfiguration = {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
    },
): IUnleashContextOutput => {
    const useProjectContext = useUiFlag('projectContextFields');

    const uri = useProjectContext ? uriFromQuery(query) : `api/admin/context`;

    const fetcher = () => {
        const path = formatApiPath(uri);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Context variables'))
            .then((res) => res.json());
    };

    const CONTEXT_CACHE_KEY = uri;

    const { data, mutate, error, isValidating } = useSWR(
        CONTEXT_CACHE_KEY,
        fetcher,
        options,
    );

    return {
        context: data || [],
        error,
        loading: isValidating && !error && !data,
        refetchUnleashContext: mutate,
    };
};

export default useUnleashContext;
