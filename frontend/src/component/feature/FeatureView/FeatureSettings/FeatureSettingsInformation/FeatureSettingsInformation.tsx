import { Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import PermissionIconButton from '../../../../common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from '../../../../providers/AccessProvider/permissions';
import { useStyles } from './FeatureSettingsInformation.style';

interface IFeatureSettingsInformationProps {
    projectId: string;
    featureId: string;
}

export const FeatureSettingsInformation = ({
    projectId,
    featureId,
}: IFeatureSettingsInformationProps) => {
    const styles = useStyles();
    const { feature } = useFeature(projectId, featureId);
    const history = useHistory();

    const onEdit = () => {
        history.push(`/projects/${projectId}/features/${featureId}/edit`);
    };

    return (
        <>
            <div className={styles.container}>
                <Typography className={styles.header}>
                    Feature information
                </Typography>
                <PermissionIconButton
                    permission={UPDATE_FEATURE}
                    projectId={projectId}
                    data-loading
                    onClick={onEdit}
                >
                    <Edit titleAccess="Edit" />
                </PermissionIconButton>
            </div>
            <Typography>
                Name: <strong>{feature.name}</strong>
            </Typography>
            <Typography>
                Description:{' '}
                <strong>
                    {feature.description.length === 0
                        ? 'no description'
                        : feature.description}
                </strong>
            </Typography>
            <Typography>
                Type: <strong>{feature.type}</strong>
            </Typography>
            <Typography>
                Impression Data:{' '}
                <strong>
                    {feature.impressionData ? 'enabled' : 'disabled'}
                </strong>
            </Typography>
        </>
    );
};
