import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import useUiConfig from '../useUiConfig/useUiConfig.js';
import type { IInternalBanner } from 'interfaces/banner';

const ENDPOINT = 'api/admin/banners';

export const useBanners = () => {
    const { isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR(
        isEnterprise(),
        { banners: [] },
        formatApiPath(ENDPOINT),
        fetcher,
    );

    return useMemo(
        () => ({
            banners: (data?.banners ?? []) as IInternalBanner[],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Banners'))
        .then((res) => res.json());
};
