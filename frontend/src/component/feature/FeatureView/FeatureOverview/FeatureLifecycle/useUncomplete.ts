import { useTracking } from 'hooks/useTracking';
import useToast from 'hooks/useToast';
import useFeatureLifecycleApi from 'hooks/api/actions/useFeatureLifecycleApi/useFeatureLifecycleApi';
import { formatUnknownError } from 'utils/formatUnknownError';

export const useUncomplete = ({
    feature,
    project,
    status,
    onChange,
}: {
    feature: string;
    project: string;
    status?: 'kept' | 'discarded';
    onChange?: () => void;
}) => {
    const { trackMutation } = useTracking({
        event: 'feature-lifecycle',
        type: 'uncomplete',
    });
    const { setToastApiError } = useToast();
    const { markFeatureUncompleted, loading } = useFeatureLifecycleApi();

    const uncompleteProps = { name: feature, status };

    const onUncompleteHandler = async () => {
        try {
            await trackMutation(
                () => markFeatureUncompleted(feature, project),
                uncompleteProps,
            );
            onChange?.();
        } catch (e) {
            setToastApiError(formatUnknownError(e));
        }
    };

    return { onUncompleteHandler, loading };
};
