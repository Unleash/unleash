import { styled, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';

interface IFeatureSettingsInformationProps {
    projectId: string;
    featureId: string;
}

const StyledContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
}));

export const FeatureSettingsInformation = ({
    projectId,
    featureId,
}: IFeatureSettingsInformationProps) => {
    const { feature } = useFeature(projectId, featureId);
    const navigate = useNavigate();

    const onEdit = () => {
        navigate(`/projects/${projectId}/features/${featureId}/edit`);
    };

    return (
        <>
            <StyledContainer>
                <StyledTypography>Feature information</StyledTypography>
                <PermissionIconButton
                    permission={UPDATE_FEATURE}
                    projectId={projectId}
                    data-loading
                    onClick={onEdit}
                    tooltipProps={{ title: 'Edit' }}
                >
                    <Edit />
                </PermissionIconButton>
            </StyledContainer>
            <Typography>
                Name: <strong>{feature.name}</strong>
            </Typography>
            <Typography>
                Description:{' '}
                <strong>
                    {!feature.description?.length
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
