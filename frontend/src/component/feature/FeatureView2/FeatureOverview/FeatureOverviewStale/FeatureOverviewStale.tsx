import { useStyles } from './FeatureOverviewStale.styles';
import classnames from 'classnames';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import { useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import { UPDATE_FEATURE } from '../../../../providers/AccessProvider/permissions';
import { useState } from 'react';
import StaleDialog from './StaleDialog/StaleDialog';
import PermissionButton from '../../../../common/PermissionButton/PermissionButton';
import classNames from 'classnames';

const FeatureOverviewStale = () => {
    const styles = useStyles();
    const [openStaleDialog, setOpenStaleDialog] = useState(false);
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);

    const flipStateButtonText = () =>
        feature.stale ? 'Set to active' : 'Set to stale';

    const statusClasses = classNames(styles.status, {
        [styles.statusStale]: feature.stale,
    });

    return (
        <div className={classnames(styles.container)}>
            <div className={styles.staleHeaderContainer}>
                <div className={styles.staleHeader}>
                    <h3 className={styles.header} data-loading>
                        Status
                    </h3>
                </div>
            </div>
            <div className={styles.body}>
                <span className={styles.bodyItem} data-loading>
                    Feature is {feature.stale ? 'stale' : 'active'}
                    <div className={statusClasses} />
                </span>
                <div className={styles.staleButton} data-loading>
                    <PermissionButton
                        onClick={() => setOpenStaleDialog(true)}
                        permission={UPDATE_FEATURE}
                        projectId={projectId}
                        tooltip="Flip status"
                        variant="text"
                    >
                        {flipStateButtonText()}
                    </PermissionButton>
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
