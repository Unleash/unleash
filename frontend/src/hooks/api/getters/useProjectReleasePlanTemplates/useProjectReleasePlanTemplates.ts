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

    return useMemo(() => {
        const templates = data ?? [];

        return {
            templates,
            // The endpoint returns global + project templates in one list;
            // project-only scoping happens client-side.
            // Will be replaced by server-side scoping in a follow up PR.
            projectTemplates: templates.filter(
                (template) => template.project === projectId,
            ),
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        };
    }, [data, error, mutate, projectId]);
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Project release templates'))
        .then((res) => res.json());
};
