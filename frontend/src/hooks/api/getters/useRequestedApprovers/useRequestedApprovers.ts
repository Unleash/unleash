import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';

// TODO: These will likely be created by Orval next time it is run
export interface ReviewerSchema {
    id: number;
    name?: string;
    email: string;
    username?: string;
    imageUrl?: string;
}

export interface IReviewersResponse {
    reviewers: ReviewerSchema[];
    refetchReviewers: () => void;
    loading: boolean;
    error?: Error;
}

export const useRequestedApprovers = (
    project: string,
    changeRequestId: number,
): IReviewersResponse => {
    const { data, error, mutate } = useSWR(
        formatApiPath(
            `api/admin/projects/${project}/change-requests/${changeRequestId}/approvers`,
        ),
        fetcher,
    );

    return useMemo(
        () => ({
            reviewers: data?.reviewers || [],
            loading: !error && !data,
            refetchReviewers: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Requested Approvers'))
        .then((res) => res.json());
};
