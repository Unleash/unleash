import { capitalize, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Edit from '@mui/icons-material/Edit';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useUiFlag } from 'hooks/useUiFlag';
import { FeatureLifecycleTooltip } from '../FeatureLifecycle/FeatureLifecycleTooltip';
import { FeatureLifecycleStageIcon } from '../FeatureLifecycle/FeatureLifecycleStageIcon';

const StyledContainer = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
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
    fontSize: theme.fontSizes.mediumHeader,
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
}));

const StyledDescription = styled('p')({
    wordBreak: 'break-word',
});

const FeatureOverviewMetaData = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);
    const { project, description, type } = feature;
    const featureLifecycleEnabled = useUiFlag('featureLifecycle');

    const IconComponent = getFeatureTypeIcons(type);

    return (
        <StyledContainer>
            <StyledPaddingContainerTop>
                <StyledMetaDataHeader data-loading>
                    <IconComponent
                        sx={(theme) => ({
                            marginRight: theme.spacing(2),
                            height: '40px',
                            width: '40px',
                            padding: theme.spacing(0.5),
                            backgroundColor:
                                theme.palette.background.alternative,
                            fill: theme.palette.primary.contrastText,
                            borderRadius: `${theme.shape.borderRadiusMedium}px`,
                        })}
                    />{' '}
                    <StyledHeader>{capitalize(type || '')} toggle</StyledHeader>
                </StyledMetaDataHeader>
                <StyledBody>
                    <StyledBodyItem data-loading>
                        Project: {project}
                    </StyledBodyItem>
                    <ConditionallyRender
                        condition={featureLifecycleEnabled}
                        show={
                            <StyledBodyItem
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'start',
                                }}
                                data-loading
                            >
                                <span>Lifecycle:</span>
                                <FeatureLifecycleTooltip
                                    stage={{ name: 'initial' }}
                                >
                                    <FeatureLifecycleStageIcon
                                        stage={{ name: 'initial' }}
                                    />
                                </FeatureLifecycleTooltip>
                            </StyledBodyItem>
                        }
                    />

                    <ConditionallyRender
                        condition={Boolean(description)}
                        show={
                            <StyledBodyItem data-loading>
                                <div>Description:</div>
                                <StyledDescriptionContainer>
                                    <StyledDescription>
                                        {description}
                                    </StyledDescription>
                                    <PermissionIconButton
                                        projectId={projectId}
                                        permission={UPDATE_FEATURE}
                                        component={Link}
                                        to={`/projects/${projectId}/features/${featureId}/settings`}
                                        tooltipProps={{
                                            title: 'Edit description',
                                        }}
                                    >
                                        <Edit />
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
                                        <Edit />
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
