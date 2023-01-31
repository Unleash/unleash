import { IPersonalAPIToken } from 'interfaces/personalAPIToken';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';

export interface IUseServiceAccountTokensOutput {
    tokens?: IPersonalAPIToken[];
    refetchTokens: () => void;
    loading: boolean;
    error?: Error;
}

export const useServiceAccountTokens = (id: number) => {
    const { uiConfig, isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR(
        Boolean(uiConfig.flags.serviceAccounts) && isEnterprise(),
        { tokens: [] },
        formatApiPath(`api/admin/service-account/${id}/token`),
        fetcher
    );

    return {
        tokens: data ? data.pats : undefined,
        loading: !error && !data,
        refetchTokens: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Service Account Tokens'))
        .then(res => res.json());
};
