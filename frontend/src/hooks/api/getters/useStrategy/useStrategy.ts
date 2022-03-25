import useSWR, { mutate, SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { defaultStrategy } from './defaultStrategy';

const useStrategy = (strategyName: string, options: SWRConfiguration = {}) => {
    const STRATEGY_CACHE_KEY = `api/admin/strategies/${strategyName}`;
    const path = formatApiPath(STRATEGY_CACHE_KEY);

    const fetcher = () => {
        return fetch(path)
            .then(handleErrorResponses(`${strategyName} strategy`))
            .then(res => res.json());
    };

    const { data, error } = useSWR(STRATEGY_CACHE_KEY, fetcher, options);

    const refetchStrategy = () => {
        mutate(STRATEGY_CACHE_KEY);
    };

    return {
        strategy: data || defaultStrategy,
        error,
        loading: !error && !data,
        refetchStrategy,
    };
};

export default useStrategy;
