import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';

// TODO: These will likely be created by Orval next time it is run
export interface AvailableReviewerSchema {
    id: number;
    name?: string;
    email: string;
    username?: string;
    imageUrl?: string;
}

export interface IAvailableReviewersResponse {
    reviewers: AvailableReviewerSchema[];
    refetchReviewers: () => void;
    loading: boolean;
    error?: Error;
}

export const useAvailableChangeRequestReviewers = (
    project: string,
    environment: string,
): IAvailableReviewersResponse => {
    const { data, error, mutate } = useSWR(
        formatApiPath(
            `api/admin/projects/${project}/change-requests/available-reviewers/${environment}`,
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
        .then(handleErrorResponses('Available Change Request Reviewers'))
        .then((res) => res.json());
};
