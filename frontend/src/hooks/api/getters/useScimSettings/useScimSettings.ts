import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import useUiConfig from '../useUiConfig/useUiConfig.js';

const ENDPOINT = 'api/admin/scim-settings';

export type ScimSettings = {
    enabled: boolean;
    hasToken: boolean;
};

const DEFAULT_DATA: ScimSettings = {
    enabled: false,
    hasToken: false,
};

export const useScimSettings = () => {
    const { isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR<ScimSettings>(
        isEnterprise(),
        DEFAULT_DATA,
        formatApiPath(ENDPOINT),
        fetcher,
    );

    return useMemo(
        () => ({
            settings: data ?? DEFAULT_DATA,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('SCIM settings'))
        .then((res) => res.json());
};
