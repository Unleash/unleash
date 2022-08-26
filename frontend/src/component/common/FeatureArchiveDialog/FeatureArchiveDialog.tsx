import { VFC } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IFeatureArchiveDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    projectId: string;
    featureId: string;
}

export const FeatureArchiveDialog: VFC<IFeatureArchiveDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    projectId,
    featureId,
}) => {
    const { archiveFeatureToggle } = useFeatureApi();
    const { setToastData, setToastApiError } = useToast();

    const archiveToggle = async () => {
        try {
            await archiveFeatureToggle(projectId, featureId);
            setToastData({
                text: 'Your feature toggle has been archived',
                type: 'success',
                title: 'Feature archived',
            });
            onConfirm();
            onClose();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
            onClose();
        }
    };

    return (
        <Dialogue
            onClick={() => archiveToggle()}
            open={isOpen}
            onClose={onClose}
            primaryButtonText="Archive toggle"
            secondaryButtonText="Cancel"
            title="Archive feature toggle"
        >
            Are you sure you want to archive this feature toggle?
        </Dialogue>
    );
};
