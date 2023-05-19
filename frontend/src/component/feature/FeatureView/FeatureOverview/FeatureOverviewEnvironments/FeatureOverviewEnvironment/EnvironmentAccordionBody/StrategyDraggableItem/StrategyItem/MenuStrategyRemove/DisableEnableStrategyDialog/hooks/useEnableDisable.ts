import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { IDisableEnableStrategyProps } from '../IDisableEnableStrategyProps';

export const useEnableDisable = ({
    projectId,
    environmentId,
    featureId,
    strategy,
}: IDisableEnableStrategyProps) => {
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setStrategyDisabledState } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();

    const onEnableDisable = (enabled: boolean) => async () => {
        try {
            await setStrategyDisabledState(
                projectId,
                featureId,
                environmentId,
                strategy.id,
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
