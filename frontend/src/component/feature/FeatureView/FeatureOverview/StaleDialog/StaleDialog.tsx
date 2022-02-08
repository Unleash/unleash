import useFeatureApi from '../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import { useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import { DialogContentText } from '@material-ui/core';
import ConditionallyRender from '../../../../common/ConditionallyRender/ConditionallyRender';
import Dialogue from '../../../../common/Dialogue';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';

interface IStaleDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    stale: boolean;
}

const StaleDialog = ({ open, setOpen, stale }: IStaleDialogProps) => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { patchFeatureToggle } = useFeatureApi();
    const { refetch } = useFeature(projectId, featureId);

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

    const onSubmit = async e => {
        e.stopPropagation();
        const patch = [{ op: 'replace', path: '/stale', value: !stale }];
        await patchFeatureToggle(projectId, featureId, patch);
        refetch();
        setOpen(false);
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
