import useFeatureApi from '../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import { useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import { DialogContentText } from '@material-ui/core';
import ConditionallyRender from '../../../../common/ConditionallyRender/ConditionallyRender';
import Dialogue from '../../../../common/Dialogue';
import { useFeature } from '../../../../../hooks/api/getters/useFeature/useFeature';
import React from 'react';
import useToast from '../../../../../hooks/useToast';
import { formatUnknownError } from '../../../../../utils/format-unknown-error';

interface IStaleDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    stale: boolean;
}

const StaleDialog = ({ open, setOpen, stale }: IStaleDialogProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { patchFeatureToggle } = useFeatureApi();
    const { refetchFeature } = useFeature(projectId, featureId);

    const toggleToStaleContent = (
        <DialogContentText>
            Setting a toggle to stale marks it for cleanup
        </DialogContentText>
    );
    const toggleToActiveContent = (
        <DialogContentText>
            Setting a toggle to active marks it as in active use
        </DialogContentText>
    );

    const toggleActionText = stale ? 'active' : 'stale';

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.stopPropagation();

        try {
            const patch = [{ op: 'replace', path: '/stale', value: !stale }];
            await patchFeatureToggle(projectId, featureId, patch);
            refetchFeature();
            setOpen(false);
        } catch (err: unknown) {
            setToastApiError(formatUnknownError(err));
        }

        if (stale) {
            setToastData({
                type: 'success',
                title: "And we're back!",
                text: 'The toggle is no longer marked as stale.',
            });
        } else {
            setToastData({
                type: 'success',
                title: 'A job well done.',
                text: 'The toggle has been marked as stale.',
            });
        }
    };

    const onCancel = () => {
        setOpen(false);
    };

    return (
        <>
            <Dialogue
                open={open}
                secondaryButtonText={'Cancel'}
                primaryButtonText={`Flip to ${toggleActionText}`}
                title={`Set feature status to ${toggleActionText}`}
                onClick={onSubmit}
                onClose={onCancel}
            >
                <>
                    <ConditionallyRender
                        condition={stale}
                        show={toggleToActiveContent}
                        elseShow={toggleToStaleContent}
                    />
                </>
            </Dialogue>
        </>
    );
};

export default StaleDialog;
