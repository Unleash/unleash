import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

export const useEnableDisable = ({
    projectId,
    environmentId,
    featureId,
    strategyId,
}: {
    projectId: string;
    environmentId: string;
    featureId: string;
    strategyId: string;
}) => {
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setStrategyDisabledState } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();

    const onEnableDisable = (enabled: boolean) => async () => {
        try {
            await setStrategyDisabledState(
                projectId,
                featureId,
                environmentId,
                strategyId,
                !enabled
            );
            setToastData({
                title: `Strategy ${enabled ? 'enabled' : 'disabled'}`,
                type: 'success',
            });

            refetchFeature();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return {
        onDisable: onEnableDisable(false),
        onEnable: onEnableDisable(true),
    };
};
