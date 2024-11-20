import { useMemo } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import { useUiFlag } from 'hooks/useUiFlag';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

const path = (templateId: string) =>
    `api/admin/release-plan-templates/${templateId}`;

const DEFAULT_DATA: IReleasePlanTemplate = {
    id: '',
    name: '',
    description: '',
    milestones: [],
    createdAt: '',
    createdByUserId: 0,
};

export const useReleasePlanTemplate = (templateId: string) => {
    const { isEnterprise } = useUiConfig();
    const releasePlansEnabled = useUiFlag('releasePlans');

    const { data, error, mutate } = useConditionalSWR<IReleasePlanTemplate>(
        isEnterprise() && releasePlansEnabled,
        DEFAULT_DATA,
        formatApiPath(path(templateId)),
        fetcher,
    );

    return useMemo(
        () => ({
            template: data ?? DEFAULT_DATA,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Release plan template'))
        .then((res) => res.json());
};
