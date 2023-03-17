import { VFC } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';

interface IFeatureArchiveDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    projectId: string;
    featureIds: string[];
}

export const FeatureArchiveDialog: VFC<IFeatureArchiveDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    projectId,
    featureIds,
}) => {
    const { archiveFeatureToggle } = useFeatureApi();
    const { archiveFeatures } = useProjectApi();
    const { setToastData, setToastApiError } = useToast();
    const isBulkArchive = featureIds?.length > 1;

    const archiveToggle = async () => {
        try {
            await archiveFeatureToggle(projectId, featureIds[0]);
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

    const archiveToggles = async () => {
        try {
            await archiveFeatures(projectId, featureIds);
            setToastData({
                text: 'Selected feature toggles have been archived',
                type: 'success',
                title: 'Feature toggles archived',
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
            onClick={isBulkArchive ? archiveToggles : archiveToggle}
            open={isOpen}
            onClose={onClose}
            primaryButtonText={
                isBulkArchive ? 'Archive toggles' : 'Archive toggle'
            }
            secondaryButtonText="Cancel"
            title={
                isBulkArchive
                    ? 'Archive feature toggles'
                    : 'Archive feature toggle'
            }
        >
            <ConditionallyRender
                condition={isBulkArchive}
                show={
                    <>
                        <p>
                            Are you sure you want to archive{' '}
                            <strong>{featureIds?.length}</strong> feature
                            toggles?
                        </p>
                        <ConditionallyRender
                            condition={featureIds?.length <= 5}
                            show={
                                <ul>
                                    {featureIds?.map(id => (
                                        <li key={id}>{id}</li>
                                    ))}
                                </ul>
                            }
                        />
                    </>
                }
                elseShow={
                    <p>
                        Are you sure you want to archive these feature toggles?
                    </p>
                }
            />
        </Dialogue>
    );
};
