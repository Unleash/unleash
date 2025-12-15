import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useToast from 'hooks/useToast';
import useFeatureLifecycleApi from 'hooks/api/actions/useFeatureLifecycleApi/useFeatureLifecycleApi';
import { formatUnknownError } from 'utils/formatUnknownError';

export const useUncomplete = ({
    feature,
    project,
    onChange,
}: {
    feature: string;
    project: string;
    onChange?: () => void;
}) => {
    const { trackEvent } = usePlausibleTracker();
    const { setToastApiError } = useToast();
    const { markFeatureUncompleted, loading } = useFeatureLifecycleApi();

    const onUncompleteHandler = async () => {
        try {
            await markFeatureUncompleted(feature, project);
            onChange?.();

            trackEvent('feature-lifecycle', {
                props: {
                    eventType: 'uncomplete',
                },
            });
        } catch (e) {
            setToastApiError(formatUnknownError(e));
        }
    };

    return { onUncompleteHandler, loading };
};
