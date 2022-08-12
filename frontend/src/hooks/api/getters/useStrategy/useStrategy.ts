import useSWR from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import { IStrategy } from 'interfaces/strategy';
import handleErrorResponses from '../httpErrorResponseHandler';

interface IUseStrategyOutput {
    strategyDefinition?: IStrategy;
    refetchStrategy: () => void;
    loading: boolean;
    error?: Error;
}

export const useStrategy = (
    strategyName: string | undefined
): IUseStrategyOutput => {
    const { data, error, mutate } = useSWR(
        strategyName
            ? formatApiPath(`api/admin/strategies/${strategyName}`)
            : null, // Don't fetch until we have a strategyName.
        fetcher
    );

    const refetchStrategy = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        strategyDefinition: data,
        refetchStrategy,
        loading: !error && !data,
        error,
    };
};

const fetcher = (path: string): Promise<IStrategy> => {
    return fetch(path)
        .then(handleErrorResponses('Strategy'))
        .then(res => res.json());
};
