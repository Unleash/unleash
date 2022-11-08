import { VFC } from 'react';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from 'hooks/useToast';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { AddStrategyMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/AddStrategyMessage';
import { getFeatureStrategyIcon } from 'utils/strategyNames';
import { useChangeRequestAddStrategy } from 'hooks/useChangeRequestAddStrategy';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PresetCard } from '../PresetCard/PresetCard';

interface IAddStandardStrategyProps {
    featureId: string;
    projectId: string;
    environmentId: string;
    onAfterAddStrategy: () => void;
}

const basicStrategy = {
    name: 'default',
    parameters: {},
    constraints: [],
};

export const AddStandardStrategyFromTemplate: VFC<
    IAddStandardStrategyProps
> = ({ featureId, projectId, environmentId, onAfterAddStrategy }) => {
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { setToastApiError } = useToast();

    const isChangeRequestEnabled = useChangeRequestsEnabled(environmentId);

    const {
        changeRequestDialogDetails,
        onChangeRequestAddStrategy,
        onChangeRequestAddStrategyConfirm,
        onChangeRequestAddStrategyClose,
    } = useChangeRequestAddStrategy(projectId, featureId, 'addStrategy');

    const onAddSimpleStrategy = async () => {
        try {
            if (isChangeRequestEnabled) {
                onChangeRequestAddStrategy(environmentId, basicStrategy);
            } else {
                await addStrategyToFeature(
                    projectId,
                    featureId,
                    environmentId,
                    basicStrategy
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
                title="Standard strategy"
                Icon={getFeatureStrategyIcon('default')}
                onClick={onAddSimpleStrategy}
                projectId={projectId}
                environmentId={environmentId}
            >
                The standard strategy is strictly on/off for your entire
                userbase.
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
