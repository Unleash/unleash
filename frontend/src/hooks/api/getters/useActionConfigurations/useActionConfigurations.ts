import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import useUiConfig from '../useUiConfig/useUiConfig.js';
import type { ActionConfiguration } from 'interfaces/action';
import { useUiFlag } from 'hooks/useUiFlag';

const DEFAULT_DATA: Record<string, ActionConfiguration> = {};

export const useActionConfigurations = (project: string) => {
    const { isEnterprise } = useUiConfig();
    const actionsEnabled = useUiFlag('automatedActions');

    const { data, error, mutate } = useConditionalSWR<
        Record<string, ActionConfiguration>
    >(
        isEnterprise() && actionsEnabled,
        DEFAULT_DATA,
        formatApiPath(`api/admin/projects/${project}/actions/config`),
        fetcher,
    );

    return useMemo(
        () => ({
            actionConfigurations: new Map<string, ActionConfiguration>(
                Object.entries(data || {}),
            ),
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Actions configuration'))
        .then((res) => res.json());
};
