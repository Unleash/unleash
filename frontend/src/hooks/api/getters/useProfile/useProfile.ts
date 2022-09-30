import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IProfile } from 'interfaces/profile';

export interface IUseProfileOutput {
    profile?: IProfile;
    refetchProfile: () => void;
    loading: boolean;
    error?: Error;
}

export const useProfile = (): IUseProfileOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath('api/admin/user/profile'),
        fetcher
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
        .then(res => res.json());
};
