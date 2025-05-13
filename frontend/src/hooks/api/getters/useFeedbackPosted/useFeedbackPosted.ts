import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { FeedbackListSchema } from 'openapi';

const KEY = `api/admin/feedback`;
const path = formatApiPath(KEY);

const useFeedbackPosted = (options: SWRConfiguration = {}) => {
    const fetcher = () => {
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('FeedbackPosted'))
            .then((res) => res.json());
    };

    const { data, error } = useSWR<FeedbackListSchema>(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetchFeedback = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        feedback: data || [],
        error,
        loading,
        refetchFeedback,
    };
};

export default useFeedbackPosted;
