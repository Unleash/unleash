import { capitalize, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Edit } from '@mui/icons-material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useFeatureTags from 'hooks/api/getters/useFeatureTags/useFeatureTags';
import FeatureOverviewTags from './FeatureOverviewTags/FeatureOverviewTags';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const StyledContainer = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    color: theme.palette.text.tertiaryContrast,
    backgroundColor: theme.palette.featureMetaData,
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

const StyledPaddingContainerBottom = styled('div')(({ theme }) => ({
    padding: '0 1.5rem 1.5rem 1.5rem',
    borderTop: `1px solid ${theme.palette.divider}`,
}));

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
    wordBreak: 'break-all',
}));

const StyledDescriptionContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.tertiaryContrast,
}));

const FeatureOverviewMetaData = () => {
    const { uiConfig } = useUiConfig();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { tags } = useFeatureTags(featureId);
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
                            fill: theme.palette.text.tertiaryContrast,
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
                                                color: theme.palette.text
                                                    .tertiaryContrast,
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
                                                color: theme.palette.text
                                                    .tertiaryContrast,
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
