import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import type { IStrategy } from 'interfaces/strategy';
import handleErrorResponses from '../httpErrorResponseHandler.js';

interface IUseStrategiesOutput {
    strategies: IStrategy[];
    refetchStrategies: () => void;
    loading: boolean;
    error?: Error;
}

const STANDARD_STRATEGIES = ['flexibleRollout', 'default'];
const mapAdvancedStrategies = (strategies: IStrategy[]): IStrategy[] =>
    strategies.map((strategy) => ({
        ...strategy,
        advanced: !STANDARD_STRATEGIES.includes(strategy.name),
    }));

export const useStrategies = (): IUseStrategiesOutput => {
    const { data, error } = useSWR(STRATEGIES_PATH, fetcher);

    const refetchStrategies = useCallback(() => {
        mutate(STRATEGIES_PATH).catch(console.warn);
    }, []);

    return {
        strategies: mapAdvancedStrategies(
            data?.strategies || defaultStrategies,
        ),
        refetchStrategies,
        loading: !error && !data,
        error,
    };
};

const fetcher = (): Promise<{ strategies: IStrategy[] }> => {
    return fetch(STRATEGIES_PATH)
        .then(handleErrorResponses('Strategy types'))
        .then((res) => res.json());
};

const flexibleRollout: IStrategy = {
    deprecated: false,
    name: 'flexibleRollout',
    displayName: 'Gradual rollout',
    editable: false,
    description:
        'Roll out to a percentage of your userbase, and ensure that the experience is the same for the user on each visit.',
    parameters: [
        {
            name: 'rollout',
            type: 'percentage',
            description: '',
            required: false,
        },
        {
            name: 'stickiness',
            type: 'string',
            description: 'Used to defined stickiness',
            required: true,
        },
        {
            name: 'groupId',
            type: 'string',
            description: '',
            required: true,
        },
    ],
};

const defaultStrategies: IStrategy[] = [flexibleRollout];

const STRATEGIES_PATH = formatApiPath(`api/admin/strategies`);
