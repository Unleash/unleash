import useSWR, { SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { emptyFeedback } from './emptyFeedback';
import { useCallback } from 'react';
import { IFeatureFeedback } from 'interfaces/featureFeedback';

export interface IFeatureFeedbackOutput {
  feedback: IFeatureFeedback[];
  refetchFeature: () => void;
  loading: boolean;
  status?: number;
  error?: Error;
}

export interface IFeatureFeedbackResponse {
  status: number;
  body?: IFeatureFeedback[];
}

export const useFeedbackForFeature = (
    featureId: string,
    options?: SWRConfiguration
): IFeatureFeedbackOutput => {
    const path = formatFeedbackApiPath(featureId);
    const { data, error, mutate } = useSWR<IFeatureFeedbackResponse>(
        ['useFeedbackForFeature', path],
        () => feedbackFetcher(path),
        options
    );

    const refetchFeature = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        feedback: data?.body || emptyFeedback,
        refetchFeature,
        loading: !error && !data,
        status: data?.status,
        error,
    };
};

export const feedbackFetcher = async (
    path: string
): Promise<IFeatureFeedbackResponse> => {
    const res = await fetch(path);

    if (res.status === 404) {
        return { status: 404 };
    }

    if (!res.ok) {
        await handleErrorResponses('Feature feedback data')(res);
    }

    return {
        status: res.status,
        body: await res.json(),
    };
};

export const formatFeedbackApiPath = (featureId: string): string => {
    return formatApiPath(`api/admin/featurefeedback/${featureId}`);
};
