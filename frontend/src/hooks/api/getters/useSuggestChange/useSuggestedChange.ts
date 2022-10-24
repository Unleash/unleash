// import useSWR from 'swr';
// import { formatApiPath } from 'utils/formatPath';
import { ISuggestChangeset } from 'interfaces/suggestChangeset';
import handleErrorResponses from '../httpErrorResponseHandler';

// FIXME: mock
const data: any = {
    id: 'f79d399f-cb38-4982-b9b6-4e0b2d2d55a3',
    environment: 'production',
    state: 'DRAFT',
    project: 'default',
    createdBy: {
        email: 'mateusz@getunleash.ai',
        avatar: 'https://gravatar-uri.com/1321',
    },
    createdAt: '2020-10-20T12:00:00.000Z',
    changes: [
        {
            id: 'f79d399f-cb38-4982-b9b6-4141sdsdaad',
            feature: 'my-feature-toggle',
            action: 'updateEnabled',
            payload: { data: true },
        },
        {
            id: 'f79d399f-cb38-4982-b9b6-4141sdsdaad',
            feature: 'new-feature-toggle',
            action: 'updateEnabled',
            payload: {
                data: { data: false },
                strategyId: '123-14',
            },
        },
    ],
};

export const useSuggestedChange = () => {
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
