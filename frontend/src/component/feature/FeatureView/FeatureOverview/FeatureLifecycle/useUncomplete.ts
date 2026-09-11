import { useTracking } from 'hooks/useTracking';
import { flagUncompletedTracking } from './lifecycleTracking';
import type { LifecycleStage } from './LifecycleStage.tsx';
import useToast from 'hooks/useToast';
import useFeatureLifecycleApi from 'hooks/api/actions/useFeatureLifecycleApi/useFeatureLifecycleApi';
import { formatUnknownError } from 'utils/formatUnknownError';

export const useUncomplete = ({
    feature,
    project,
    stage,
    onChange,
}: {
    feature: string;
    project: string;
    stage?: LifecycleStage;
    onChange?: () => void;
}) => {
    const status = stage?.name === 'completed' ? stage.status : undefined;
    const trackFlagUncompleted = useTracking(
        flagUncompletedTracking({ name: feature, status }),
    );
    const { setToastApiError } = useToast();
    const { markFeatureUncompleted, loading } = useFeatureLifecycleApi();

    const onUncompleteHandler = async () => {
        try {
            await trackFlagUncompleted.mutation(() =>
                markFeatureUncompleted(feature, project),
            );
            onChange?.();
        } catch (e) {
            setToastApiError(formatUnknownError(e));
        }
    };

    return { onUncompleteHandler, loading };
};
