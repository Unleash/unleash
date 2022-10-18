// import useSWR from 'swr';
// import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

// FIXME: mock
const data = {
    id: '1312',
    environment: 'production',
    state: 'REVIEW',
    createdAt: '2021-03-01T12:00:00.000Z',
    lastUpdatedAt: '2021-03-01T12:00:00.000Z',
    project: 'default',
    createdBy: {
        name: 'John Doe',
        id: '123412341',
        email: 'john.doe@yahoo.com',
        imageUrl:
            'https://gravatar.com/avatar/e64c7df2d1972fa5d3d7dd61?size=42&default=retro',
    },
    approvers: [
        {
            status: 'WAITING',
            name: 'Bruce Wane',
            id: '123412341',
            email: 'john.doe@yahoo.com',
            imageUrl:
                'https://gravatar.com/avatar/e64c7df2d42a5d3d7dd61?size=42&default=retro',
        },
        {
            status: 'APPROVED',
            name: 'Clark Kent',
            id: '123412341',
            email: 'john.doe@yahoo.com',
            imageUrl:
                'https://gravatar.com/avatar/e64c7d89f26bd1972fa85d13d7dd61?size=42&default=retro',
        },
    ],
    // submittedBy: ??
    changeSet: [
        {
            feature: 'feature1',
            // featureToggle: {
            //     //...state
            // },
            changes: [
                {
                    id: '123',
                    action: 'updateEnabled',
                    payload: true,
                    updatedBy: 'user1',
                    eventData: {},
                    createdAt: '2021-03-01T12:00:00.000Z',
                },
            ],
        },
        {
            feature: 'feature2',
            // featureToggle: {
            //     //...state
            // },
            changes: [
                {
                    id: '456',
                    action: 'updateEnabled',
                    payload: false,
                    updatedBy: 'user1',
                    eventData: {},
                    createdAt: '2022-09-30T16:34:00.000Z',
                },
            ],
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
