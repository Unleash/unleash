import useSWR, { type SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { IUnleashContextDefinition } from 'interfaces/context';
import { useWorkspaceContext } from 'contexts/WorkspaceContext';

interface IUnleashContextOutput {
    context: IUnleashContextDefinition[];
    refetchUnleashContext: () => void;
    loading: boolean;
    error?: Error;
}

const useUnleashContext = (
    options: SWRConfiguration = {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
    },
): IUnleashContextOutput => {
    const { currentWorkspaceId } = useWorkspaceContext();

    // Determine the base path based on whether we have a workspace ID
    const basePath =
        currentWorkspaceId !== null
            ? `api/admin/workspaces/${currentWorkspaceId}/context`
            : 'api/admin/context';

    const CONTEXT_CACHE_KEY = basePath;

    const fetcher = () => {
        const path = formatApiPath(CONTEXT_CACHE_KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Context variables'))
            .then((res) => res.json());
    };

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
