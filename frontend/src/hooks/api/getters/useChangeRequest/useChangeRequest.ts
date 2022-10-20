// import useSWR from 'swr';
// import { formatApiPath } from 'utils/formatPath';
import { ISuggestChangeset } from 'interfaces/suggestChangeset';
import handleErrorResponses from '../httpErrorResponseHandler';

// FIXME: mock
const data: ISuggestChangeset = {
    id: 123,
    environment: 'production',
    state: 'REVIEW',
    createdAt: new Date('2021-03-01T12:00:00.000Z'),
    project: 'default',
    createdBy: '123412341',
    changes: [
        {
            id: 1,
            feature: 'feature1',
            action: 'updateEnabled',
            payload: true,
            createdAt: new Date('2021-03-01T12:00:00.000Z'),
        },
        {
            id: 2,
            feature: 'feature2',
            action: 'updateEnabled',
            payload: false,
            createdAt: new Date('2022-09-30T16:34:00.000Z'),
        },
    ],
};

export const useChangeRequest = () => {
    // const { data, error, mutate } = useSWR(
    //     formatApiPath(`api/admin/suggest-changes/${id}`),
    //     fetcher
    // );

    return {
        data,
        // loading: !error && !data,
        // refetchChangeRequest: () => mutate(),
        // error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Request changes'))
        .then(res => res.json());
};
