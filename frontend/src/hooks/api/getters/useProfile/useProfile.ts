import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { ProfileSchema } from 'openapi';

export interface IUseProfileOutput {
    profile?: ProfileSchema;
    refetchProfile: () => void;
    loading: boolean;
    error?: Error;
}

export const useProfile = (): IUseProfileOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath('api/admin/user/profile'),
        fetcher,
    );

    return {
        profile: data,
        loading: !error && !data,
        refetchProfile: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Profile'))
        .then((res) => res.json());
};
