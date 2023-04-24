import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

export const useSuggestEnableDisable = ({
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
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { setToastData, setToastApiError } = useToast();
    const onSuggestEnableDisable = (enabled: boolean) => async () => {
        console.log('onSuggestEnableDisable', enabled)
        try {
            await addChange(projectId, environmentId, {
                action: 'updateStrategy',
                feature: featureId,
                payload: {
                    id: strategyId,
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
