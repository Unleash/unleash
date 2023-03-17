import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { PatsSchema } from 'openapi';
import { IPersonalAPIToken } from 'interfaces/personalAPIToken';

export interface IUsePersonalAPITokensOutput {
    tokens?: IPersonalAPIToken[];
    refetchTokens: () => void;
    loading: boolean;
    error?: Error;
}

export const usePersonalAPITokens = (): IUsePersonalAPITokensOutput => {
    const { data, error, mutate } = useSWR<PatsSchema>(
        formatApiPath('api/admin/user/tokens'),
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
        .then(handleErrorResponses('Personal API Tokens'))
        .then(res => res.json());
};
