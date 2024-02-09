import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import { IActionSet } from 'interfaces/action';
import { useUiFlag } from 'hooks/useUiFlag';

export const useActions = (project: string) => {
    const { isEnterprise } = useUiConfig();
    const actionsEnabled = useUiFlag('automatedActions');

    const { data, error, mutate } = useConditionalSWR<{
        actions: IActionSet[];
    }>(
        isEnterprise() && actionsEnabled,
        { actions: [] },
        formatApiPath(`api/admin/projects/${project}/actions`),
        fetcher,
    );

    return useMemo(
        () => ({
            actions: (data?.actions ?? []) as IActionSet[],
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
