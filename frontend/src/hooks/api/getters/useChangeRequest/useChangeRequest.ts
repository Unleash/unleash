import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

export interface IUseChangeRequestOutput {
    changeRequest: any;
    loading: boolean;
    refetchChangeRequest: () => void;
    error?: Error;
}

export const useChangeRequest = (id: string): IUseChangeRequestOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/suggest-changes/${id}`),
        fetcher
    );

    return {
        changeRequest: data,
        loading: !error && !data,
        refetchChangeRequest: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Request changes'))
        .then(res => res.json());
};
