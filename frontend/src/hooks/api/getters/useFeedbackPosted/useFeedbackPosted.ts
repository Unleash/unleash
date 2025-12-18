import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import { createFetcher } from '../useApiGetter/useApiGetter.js';
import type { FeedbackListSchema } from 'openapi';

const KEY = `api/admin/feedback`;
const path = formatApiPath(KEY);

const useFeedbackPosted = (options: SWRConfiguration = {}) => {
    const fetcher = createFetcher({
        url: path,
        errorTarget: 'FeedbackPosted',
    });

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
