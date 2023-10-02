import { capitalize, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Edit } from '@mui/icons-material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

const StyledContainer = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.background.alternative,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '350px',
    minWidth: '350px',
    marginRight: theme.spacing(2),
    [theme.breakpoints.down(1000)]: {
        width: '100%',
        maxWidth: 'none',
        minWidth: 'auto',
    },
}));

const StyledPaddingContainerTop = styled('div')({
    padding: '1.5rem 1.5rem 0 1.5rem',
});

const StyledMetaDataHeader = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const StyledHeader = styled('h2')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: 'normal',
    margin: 0,
}));

const StyledBody = styled('div')(({ theme }) => ({
    margin: theme.spacing(2, 0),
    display: 'flex',
    flexDirection: 'column',
}));

const StyledBodyItem = styled('span')(({ theme }) => ({
    margin: theme.spacing(1, 0),
    fontSize: theme.fontSizes.bodySize,
}));

const StyledDescriptionContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.contrastText,
}));

const FeatureOverviewMetaData = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);
    const { project, description, type } = feature;

    const IconComponent = getFeatureTypeIcons(type);

    return (
        <StyledContainer>
            <StyledPaddingContainerTop>
                <StyledMetaDataHeader data-loading>
                    <IconComponent
                        sx={theme => ({
                            marginRight: theme.spacing(2),
                            height: '40px',
                            width: '40px',
                            fill: theme.palette.primary.contrastText,
                        })}
                    />{' '}
                    <StyledHeader>{capitalize(type || '')} toggle</StyledHeader>
                </StyledMetaDataHeader>
                <StyledBody>
                    <StyledBodyItem data-loading>
                        Project: {project}
                    </StyledBodyItem>
                    <ConditionallyRender
                        condition={Boolean(description)}
                        show={
                            <StyledBodyItem data-loading>
                                <div>Description:</div>
                                <StyledDescriptionContainer>
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
                                        <Edit
                                            sx={theme => ({
                                                color: theme.palette.primary
                                                    .contrastText,
                                            })}
                                        />
                                    </PermissionIconButton>
                                </StyledDescriptionContainer>
                            </StyledBodyItem>
                        }
                        elseShow={
                            <span data-loading>
                                <StyledDescriptionContainer>
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
                                        <Edit
                                            sx={theme => ({
                                                color: theme.palette.primary
                                                    .contrastText,
                                            })}
                                        />
                                    </PermissionIconButton>
                                </StyledDescriptionContainer>
                            </span>
                        }
                    />
                </StyledBody>
            </StyledPaddingContainerTop>
        </StyledContainer>
    );
};

export default FeatureOverviewMetaData;
