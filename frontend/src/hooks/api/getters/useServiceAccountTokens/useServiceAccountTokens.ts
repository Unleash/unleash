import { IPersonalAPIToken } from 'interfaces/personalAPIToken';
import { PatsSchema } from 'openapi';
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

export const useServiceAccountTokens = (
    id: number
): IUseServiceAccountTokensOutput => {
    const { isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR<PatsSchema>(
        isEnterprise(),
        { pats: [] },
        formatApiPath(`api/admin/service-account/${id}/token`),
        fetcher
    );

    return {
        // FIXME: schema issue
        tokens: data ? (data.pats as any) : undefined,
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
