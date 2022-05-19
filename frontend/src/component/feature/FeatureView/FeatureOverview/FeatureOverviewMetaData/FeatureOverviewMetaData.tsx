import { capitalize } from '@mui/material';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './FeatureOverviewMetadata.styles';
import { Edit } from '@mui/icons-material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useTags from 'hooks/api/getters/useTags/useTags';
import FeatureOverviewTags from './FeatureOverviewTags/FeatureOverviewTags';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

const FeatureOverviewMetaData = () => {
    const { classes: styles } = useStyles();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { tags } = useTags(featureId);
    const { feature } = useFeature(projectId, featureId);
    const { project, description, type } = feature;

    const IconComponent = getFeatureTypeIcons(type);

    return (
        <div className={classnames(styles.container)}>
            <div className={styles.paddingContainerTop}>
                <div className={styles.metaDataHeader} data-loading>
                    <IconComponent className={styles.headerIcon} />{' '}
                    <h2 className={styles.header}>
                        {capitalize(type || '')} toggle
                    </h2>
                </div>
                <div className={styles.body}>
                    <span className={styles.bodyItem} data-loading>
                        Project: {project}
                    </span>
                    <ConditionallyRender
                        condition={Boolean(description)}
                        show={
                            <span className={styles.bodyItem} data-loading>
                                <div>Description:</div>
                                <div className={styles.descriptionContainer}>
                                    <p>{description}</p>
                                    <PermissionIconButton
                                        projectId={projectId}
                                        permission={UPDATE_FEATURE}
                                        component={Link}
                                        to={`/projects/${projectId}/features/${featureId}/settings`}
                                        tooltipProps={{
                                            title: 'Edit description',
                                        }}
                                    >
                                        <Edit className={styles.editIcon} />
                                    </PermissionIconButton>
                                </div>
                            </span>
                        }
                        elseShow={
                            <span data-loading>
                                <div className={styles.descriptionContainer}>
                                    No description.{' '}
                                    <PermissionIconButton
                                        projectId={projectId}
                                        permission={UPDATE_FEATURE}
                                        component={Link}
                                        to={`/projects/${projectId}/features/${featureId}/settings`}
                                        tooltipProps={{
                                            title: 'Edit description',
                                        }}
                                    >
                                        <Edit className={styles.editIcon} />
                                    </PermissionIconButton>
                                </div>
                            </span>
                        }
                    />
                </div>
            </div>
            <ConditionallyRender
                condition={tags.length > 0}
                show={
                    <div className={styles.paddingContainerBottom}>
                        <FeatureOverviewTags projectId={projectId} />
                    </div>
                }
            />
        </div>
    );
};

export default FeatureOverviewMetaData;
