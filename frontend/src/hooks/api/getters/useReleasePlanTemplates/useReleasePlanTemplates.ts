import { useMemo } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig.js';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import { releaseTemplatesApiPath } from './releaseTemplatesApiPath.js';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

const DEFAULT_DATA: IReleasePlanTemplate[] = [];

export const useReleasePlanTemplates = () => {
    const { isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR<IReleasePlanTemplate[]>(
        isEnterprise(),
        DEFAULT_DATA,
        formatApiPath(releaseTemplatesApiPath()),
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
        .then(handleErrorResponses('Release templates'))
        .then((res) => res.json());
};
