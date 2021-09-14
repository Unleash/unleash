import { capitalize, IconButton } from '@material-ui/core';
import classnames from 'classnames';
import { useParams } from 'react-router-dom';
import { useCommonStyles } from '../../../../common.styles';
import useFeature from '../../../../hooks/api/getters/useFeature/useFeature';
import { getFeatureTypeIcons } from '../../../../utils/get-feature-type-icons';
import ConditionallyRender from '../../../common/ConditionallyRender';
import { useStyles } from './FeatureViewMetadata.styles';

import { Edit } from '@material-ui/icons';

const FeatureViewMetaData = () => {
    const styles = useStyles();
    const commonStyles = useCommonStyles();
    const { projectId, featureId } = useParams();

    const { feature } = useFeature(projectId, featureId);

    const { project, description, type } = feature;

    const IconComponent = getFeatureTypeIcons(type);

    return (
        <div
            className={classnames(
                styles.container,
                commonStyles.contentSpacingY
            )}
        >
            <span className={styles.metaDataHeader}>
                <IconComponent className={styles.headerIcon} />{' '}
                {capitalize(type || '')} toggle
            </span>
            <span>Project: {project}</span>
            <ConditionallyRender
                condition
                show={
                    <span>
                        Description: {description}{' '}
                        <IconButton>
                            <Edit />
                        </IconButton>
                    </span>
                }
                elseShow={
                    <span>
                        No description.{' '}
                        <IconButton>
                            <Edit />
                        </IconButton>
                    </span>
                }
            />
        </div>
    );
};

export default FeatureViewMetaData;
