import useSWR, { SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IUnleashContextDefinition } from 'interfaces/context';

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
    }
): IUnleashContextOutput => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/context`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Context variables'))
            .then(res => res.json());
    };

    const CONTEXT_CACHE_KEY = 'api/admin/context';

    const { data, mutate, error, isValidating } = useSWR(
        CONTEXT_CACHE_KEY,
        fetcher,
        options
    );

    return {
        context: data || [],
        error,
        loading: isValidating && !error && !data,
        refetchUnleashContext: mutate,
    };
};

export default useUnleashContext;
