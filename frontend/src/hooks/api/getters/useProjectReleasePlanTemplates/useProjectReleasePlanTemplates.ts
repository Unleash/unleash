import { useMemo } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig.js';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import { useUiFlag } from 'hooks/useUiFlag';
import { releaseTemplatesApiPath } from '../useReleasePlanTemplates/releaseTemplatesApiPath.js';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

const DEFAULT_DATA: IReleasePlanTemplate[] = [];

export const useProjectReleasePlanTemplates = (projectId: string) => {
    const { isEnterprise } = useUiConfig();
    const projectReleaseTemplatesEnabled = useUiFlag('projectReleaseTemplates');

    const { data, error, mutate } = useConditionalSWR<IReleasePlanTemplate[]>(
        isEnterprise() && projectReleaseTemplatesEnabled,
        DEFAULT_DATA,
        formatApiPath(releaseTemplatesApiPath(projectId)),
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
        .then(handleErrorResponses('Project release templates'))
        .then((res) => res.json());
};
