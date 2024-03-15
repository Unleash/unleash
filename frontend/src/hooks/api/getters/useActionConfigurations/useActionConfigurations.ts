import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import { ActionConfiguration } from 'interfaces/action';
import { useUiFlag } from 'hooks/useUiFlag';

const DEFAULT_DATA = {
    actions: [],
};

export const useActionConfigurations = (project: string) => {
    const { isEnterprise } = useUiConfig();
    const actionsEnabled = useUiFlag('automatedActions');

    const { data, error, mutate } = useConditionalSWR<{
        actions: ActionConfiguration[];
    }>(
        isEnterprise() && actionsEnabled,
        DEFAULT_DATA,
        formatApiPath(`api/admin/projects/${project}/actions/config`),
        fetcher,
    );

    return useMemo(
        () => ({
            actionConfigurations: new Map<string, ActionConfiguration>(
                [...(data?.actions ? data.actions : [])].map((action) => [
                    action.name,
                    action,
                ]),
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
