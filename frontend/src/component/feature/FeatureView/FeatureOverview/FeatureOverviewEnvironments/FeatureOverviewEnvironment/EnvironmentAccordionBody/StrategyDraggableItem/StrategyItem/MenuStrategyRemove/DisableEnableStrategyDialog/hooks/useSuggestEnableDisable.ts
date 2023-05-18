import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { IDisableEnableStrategyProps } from '../IDisableEnableStrategyProps';

export const useSuggestEnableDisable = ({
    projectId,
    environmentId,
    featureId,
    strategy,
}: IDisableEnableStrategyProps) => {
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { setToastData, setToastApiError } = useToast();
    const onSuggestEnableDisable = (enabled: boolean) => async () => {
        try {
            await addChange(projectId, environmentId, {
                action: 'updateStrategy',
                feature: featureId,
                payload: {
                    ...strategy,
                    disabled: !enabled,
                },
            });
            setToastData({
                title: 'Changes added to the draft!',
                type: 'success',
            });
            await refetchChangeRequests();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };
    return {
        onSuggestDisable: onSuggestEnableDisable(false),
        onSuggestEnable: onSuggestEnableDisable(true),
    };
};
