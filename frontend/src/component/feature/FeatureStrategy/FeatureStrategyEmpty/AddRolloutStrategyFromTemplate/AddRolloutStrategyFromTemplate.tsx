import { VFC } from 'react';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from 'hooks/useToast';
import { AddStrategyMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/AddStrategyMessage';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { getFeatureStrategyIcon } from 'utils/strategyNames';
import { useChangeRequestAddStrategy } from 'hooks/useChangeRequestAddStrategy';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { PresetCard } from '../PresetCard/PresetCard';

interface IAddRolloutStrategyProps {
    featureId: string;
    projectId: string;
    environmentId: string;
    onAfterAddStrategy: () => void;
}

export const AddRolloutStrategyFromTemplate: VFC<IAddRolloutStrategyProps> = ({
    featureId,
    projectId,
    environmentId,
    onAfterAddStrategy,
}) => {
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { setToastApiError } = useToast();

    const { feature } = useFeature(projectId, featureId);
    const isChangeRequestEnabled = useChangeRequestsEnabled(environmentId);

    const rolloutStrategy = {
        name: 'flexibleRollout',
        parameters: {
            rollout: '50',
            stickiness: 'default',
            groupId: feature.name,
        },
        constraints: [],
    };

    const {
        changeRequestDialogDetails,
        onChangeRequestAddStrategy,
        onChangeRequestAddStrategyConfirm,
        onChangeRequestAddStrategyClose,
    } = useChangeRequestAddStrategy(projectId, featureId, 'addStrategy');

    const onAddGradualRolloutStrategy = async () => {
        try {
            if (isChangeRequestEnabled) {
                onChangeRequestAddStrategy(environmentId, rolloutStrategy);
            } else {
                await addStrategyToFeature(
                    projectId,
                    featureId,
                    environmentId,
                    rolloutStrategy
                );
                onAfterAddStrategy();
            }
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <PresetCard
                title="Gradual rollout"
                Icon={getFeatureStrategyIcon('flexibleRollout')}
                onClick={onAddGradualRolloutStrategy}
                projectId={projectId}
                environmentId={environmentId}
            >
                Roll out to a percentage of your userbase.
            </PresetCard>
            <ChangeRequestDialogue
                isOpen={changeRequestDialogDetails.isOpen}
                onClose={onChangeRequestAddStrategyClose}
                environment={changeRequestDialogDetails?.environment}
                onConfirm={onChangeRequestAddStrategyConfirm}
                messageComponent={
                    <AddStrategyMessage
                        environment={environmentId}
                        payload={changeRequestDialogDetails.strategy!}
                    />
                }
            />
        </>
    );
};
