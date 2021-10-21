import { capitalize, IconButton } from '@material-ui/core';
import classnames from 'classnames';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import { getFeatureTypeIcons } from '../../../../../utils/get-feature-type-icons';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import { useStyles } from './FeatureOverviewMetadata.styles';

import { Edit } from '@material-ui/icons';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import PermissionIconButton from '../../../../common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from '../../../../providers/AccessProvider/permissions';

const FeatureOverviewMetaData = () => {
    const styles = useStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();

    const { feature } = useFeature(projectId, featureId);

    const { project, description, type } = feature;

    const IconComponent = getFeatureTypeIcons(type);

    return (
        <div className={classnames(styles.container)}>
            <div className={styles.metaDataHeader} data-loading>
                <IconComponent className={styles.headerIcon} />{' '}
                <h3 className={styles.header}>
                    {capitalize(type || '')} toggle
                </h3>
            </div>
            <div className={styles.body}>
                <span className={styles.bodyItem} data-loading>
                    Project: {project}
                </span>
                <ConditionallyRender
                    condition={description}
                    show={
                        <span className={styles.bodyItem} data-loading>
                            <div>Description:</div>
                            <div className={styles.descriptionContainer}>
                                <p>{description}</p>
                                <PermissionIconButton
                                    projectId={projectId}
                                    permission={UPDATE_FEATURE}
                                    component={Link}
                                    to={`/projects/${projectId}/features2/${featureId}/settings`}
                                >
                                    <Edit />
                                </PermissionIconButton>
                            </div>
                        </span>
                    }
                    elseShow={
                        <span data-loading>
                            <div className={styles.descriptionContainer}>
                                No description.{' '}
                                <IconButton
                                    component={Link}
                                    to={`/projects/${projectId}/features2/${featureId}/settings`}
                                >
                                    <Edit />
                                </IconButton>
                            </div>
                        </span>
                    }
                />
            </div>
        </div>
    );
};

export default FeatureOverviewMetaData;
