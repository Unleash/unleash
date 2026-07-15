import { fetcher } from '../useApiGetter/useApiGetter.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import { formatApiPath } from 'utils/formatPath';
import type { ProjectFlagCreatorsSchemaItem } from 'openapi';
import { useUiFlag } from 'hooks/useUiFlag';

type FlagCreatorsResponse = {
    total: number;
    flagCreators: ProjectFlagCreatorsSchemaItem[];
};

export const useFlagCreators = () => {
    const enabled = useUiFlag('flagListCreatedByFilter');
    const url = formatApiPath('api/admin/flag-creators?limit=500');
    const { data } = useConditionalSWR<FlagCreatorsResponse>(
        enabled,
        { total: 0, flagCreators: [] },
        url,
        () => fetcher(url, 'Flag creators'),
    );

    return { flagCreators: data?.flagCreators ?? [] };
};
