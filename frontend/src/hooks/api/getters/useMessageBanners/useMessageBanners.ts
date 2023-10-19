import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { IInternalMessageBanner } from 'interfaces/messageBanner';

const ENDPOINT = 'api/admin/message-banners';

export const useMessageBanners = () => {
    const { isEnterprise } = useUiConfig();
    const internalMessageBanners = useUiFlag('internalMessageBanners');

    const { data, error, mutate } = useConditionalSWR(
        isEnterprise() && internalMessageBanners,
        { messageBanners: [] },
        formatApiPath(ENDPOINT),
        fetcher,
    );

    return useMemo(
        () => ({
            messageBanners: (data?.messageBanners ??
                []) as IInternalMessageBanner[],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Message Banners'))
        .then((res) => res.json());
};
