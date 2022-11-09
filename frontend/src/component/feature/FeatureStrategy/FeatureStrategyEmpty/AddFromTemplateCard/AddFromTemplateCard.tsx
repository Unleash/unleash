import { ElementType, FC } from 'react';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from 'hooks/useToast';
import { AddStrategyMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/AddStrategyMessage';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestAddStrategy } from 'hooks/useChangeRequestAddStrategy';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PresetCard } from './PresetCard/PresetCard';
import { IFeatureStrategyPayload } from 'interfaces/strategy';

interface IAddFromTemplateCardProps {
    title: string;
    featureId: string;
    projectId: string;
    environmentId: string;
    strategy: IFeatureStrategyPayload;
    Icon: ElementType;
    onAfterAddStrategy: () => void;
}

export const AddFromTemplateCard: FC<IAddFromTemplateCardProps> = ({
    title,
    children,
    featureId,
    projectId,
    environmentId,
    strategy,
    Icon,
    onAfterAddStrategy,
}) => {
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { setToastApiError } = useToast();

    const isChangeRequestEnabled = useChangeRequestsEnabled(environmentId);

    const {
        changeRequestDialogDetails,
        onChangeRequestAddStrategy,
        onChangeRequestAddStrategyConfirm,
        onChangeRequestAddStrategyClose,
    } = useChangeRequestAddStrategy(projectId, featureId, 'addStrategy');

    const onStrategy = async () => {
        try {
            if (isChangeRequestEnabled) {
                onChangeRequestAddStrategy(environmentId, strategy);
            } else {
                await addStrategyToFeature(
                    projectId,
                    featureId,
                    environmentId,
                    strategy
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
                title={title}
                Icon={Icon}
                onClick={onStrategy}
                projectId={projectId}
                environmentId={environmentId}
            >
                {children}
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
