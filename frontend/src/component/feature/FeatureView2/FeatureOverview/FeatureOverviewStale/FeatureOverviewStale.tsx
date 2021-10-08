import { useStyles } from './FeatureOverviewStale.styles';
import classnames from 'classnames';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import { useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import PermissionIconButton from '../../../../common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from '../../../../AccessProvider/permissions';
import { Check, Close } from '@material-ui/icons';
import { useState } from 'react';
import StaleDialog from './StaleDialog/StaleDialog';

const FeatureOverviewStale = () => {
    const styles = useStyles();
    const [openStaleDialog, setOpenStaleDialog] = useState(false);
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);

    const FlipStateButton = () => (feature.stale ? <Close /> : <Check />);

    return (
        <div className={classnames(styles.container)}>
            <div className={styles.staleHeaderContainer}>
                <div className={styles.staleHeader}>
                    <h3 className={styles.header}>Status</h3>
                </div>
            </div>
            <div className={styles.body}>
                <span className={styles.bodyItem}>
                    Feature is {feature.stale ? 'stale' : 'active'}
                </span>
                <div className={styles.staleButton}>
                    <PermissionIconButton
                        onClick={() => setOpenStaleDialog(true)}
                        permission={UPDATE_FEATURE}
                        tooltip="Flip status"
                    >
                        <FlipStateButton />
                    </PermissionIconButton>
                </div>
            </div>
            <StaleDialog
                stale={feature.stale}
                open={openStaleDialog}
                setOpen={setOpenStaleDialog}
            />
        </div>
    );
};

export default FeatureOverviewStale;
