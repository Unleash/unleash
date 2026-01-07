import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import useUiConfig from '../useUiConfig/useUiConfig.js';
import type { IActionSet } from 'interfaces/action';
import { useUiFlag } from 'hooks/useUiFlag';

const DEFAULT_DATA = {
    actions: [],
};

export const useActions = (project: string) => {
    const { isEnterprise } = useUiConfig();
    const actionsEnabled = useUiFlag('automatedActions');

    const { data, error, mutate } = useConditionalSWR<{
        actions: IActionSet[];
    }>(
        isEnterprise() && actionsEnabled,
        DEFAULT_DATA,
        formatApiPath(`api/admin/projects/${project}/actions`),
        fetcher,
    );

    return useMemo(
        () => ({
            actions: data?.actions ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Actions'))
        .then((res) => res.json());
};
