import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useToast from 'hooks/useToast';
import type { IDisableEnableStrategyProps } from '../IDisableEnableStrategyProps.jsx';

export const useEnableDisable = ({
    projectId,
    environmentId,
    featureId,
    strategy,
}: IDisableEnableStrategyProps) => {
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setStrategyDisabledState } = useFeatureStrategyApi();
    const { setToastData } = useToast();

    const onEnableDisable = (enabled: boolean) => async () => {
        await setStrategyDisabledState(
            projectId,
            featureId,
            environmentId,
            strategy.id,
            !enabled,
        );
        setToastData({
            text: `Strategy ${enabled ? 'enabled' : 'disabled'}`,
            type: 'success',
        });

        refetchFeature();
    };

    return {
        onDisable: onEnableDisable(false),
        onEnable: onEnableDisable(true),
    };
};
