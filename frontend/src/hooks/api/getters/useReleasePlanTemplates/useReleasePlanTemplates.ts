import { useMemo } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import { useUiFlag } from 'hooks/useUiFlag';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

const ENDPOINT = 'api/admin/release-plan-templates';

const DEFAULT_DATA: IReleasePlanTemplate[] = [];

export const useReleasePlanTemplates = () => {
    const { isEnterprise } = useUiConfig();
    const releasePlansEnabled = useUiFlag('releasePlans');

    const { data, error, mutate } = useConditionalSWR<IReleasePlanTemplate[]>(
        isEnterprise() && releasePlansEnabled,
        DEFAULT_DATA,
        formatApiPath(ENDPOINT),
        fetcher,
    );

    return useMemo(
        () => ({
            templates: data ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Release plan templates'))
        .then((res) => res.json());
};
