import useSWR, { mutate } from 'swr';
import { useEffect, useState } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import { IStrategy } from '../../../../interfaces/strategy';
import handleErrorResponses from '../httpErrorResponseHandler';

export const STRATEGIES_CACHE_KEY = 'api/admin/strategies';

const flexibleRolloutStrategy: IStrategy = {
    deprecated: false,
    name: 'flexibleRollout',
    displayName: 'Gradual rollout',
    editable: false,
    description: 'Roll out to a percentage of your userbase, and ensure that the experience is the same for the user on each visit.',
    parameters: [{
        name: 'rollout', type: 'percentage', description: '', required: false
    }, {
        name: 'stickiness',
        type: 'string',
        description: 'Used to defined stickiness',
        required: true
    }, { name: 'groupId', type: 'string', description: '', required: true }]
};

const useStrategies = () => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/strategies`);

        return fetch(path, {
            method: 'GET',
            credentials: 'include'
        }).then(handleErrorResponses('Strategies')).then(res => res.json());
    };

    const { data, error } = useSWR<{ strategies: IStrategy[] }>(
        STRATEGIES_CACHE_KEY,
        fetcher
    );
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(STRATEGIES_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        strategies: data?.strategies || [flexibleRolloutStrategy],
        error,
        loading,
        refetch
    };
};

export default useStrategies;
