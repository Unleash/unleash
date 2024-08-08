import { Box, capitalize, styled } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Edit from '@mui/icons-material/Edit';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { useState } from 'react';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';
import { StyledDetail } from '../FeatureOverviewSidePanel/FeatureOverviewSidePanelDetails/StyledRow';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { FeatureEnvironmentSeen } from '../../FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import { DependencyRow } from './DependencyRow';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useShowDependentFeatures } from './useShowDependentFeatures';
import type { ILastSeenEnvironments } from 'interfaces/featureToggle';
import { FeatureLifecycle } from '../FeatureLifecycle/FeatureLifecycle';
import { MarkCompletedDialogue } from '../FeatureLifecycle/MarkCompletedDialogue';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

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
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: 'normal',
    margin: 0,
}));

const StyledBody = styled('div')(({ theme }) => ({
    margin: theme.spacing(2, 0),
    display: 'flex',
    flexDirection: 'column',
    fontSize: theme.fontSizes.smallBody,
}));

const BodyItemWithIcon = styled('div')(({ theme }) => ({}));

const SpacedBodyItem = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
}));

const StyledDescriptionContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledDetailsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledDescription = styled('p')({
    wordBreak: 'break-word',
});

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    margin: theme.spacing(1),
}));

export const StyledLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
}));

const FeatureOverviewMetaData = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature } = useFeature(projectId, featureId);
    const { project, description, type } = feature;
    const navigate = useNavigate();
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [showMarkCompletedDialogue, setShowMarkCompletedDialogue] =
        useState(false);

    const { locationSettings } = useLocationSettings();
    const showDependentFeatures = useShowDependentFeatures(feature.project);

    const lastSeenEnvironments: ILastSeenEnvironments[] =
        feature.environments?.map((env) => ({
            name: env.name,
            lastSeenAt: env.lastSeenAt,
            enabled: env.enabled,
            yes: env.yes,
            no: env.no,
        }));

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
                    <SpacedBodyItem data-loading>
                        <StyledLabel>Project:</StyledLabel>
                        <Box sx={{ wordBreak: 'break-all' }}>{project}</Box>
                    </SpacedBodyItem>
                    <ConditionallyRender
                        condition={Boolean(feature.lifecycle)}
                        show={
                            <SpacedBodyItem data-loading>
                                <StyledLabel>Lifecycle:</StyledLabel>
                                <FeatureLifecycle
                                    feature={feature}
                                    onArchive={() => setShowDelDialog(true)}
                                    onComplete={() =>
                                        setShowMarkCompletedDialogue(true)
                                    }
                                    onUncomplete={refetchFeature}
                                />
                            </SpacedBodyItem>
                        }
                    />

                    <ConditionallyRender
                        condition={Boolean(description)}
                        show={
                            <BodyItemWithIcon data-loading sx={{ pt: 1 }}>
                                <StyledLabel>Description:</StyledLabel>
                                <StyledDescriptionContainer>
                                    <StyledDescription>
                                        {description}
                                    </StyledDescription>
                                    <PermissionIconButton
                                        size='medium'
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
                            </BodyItemWithIcon>
                        }
                        elseShow={
                            <div data-loading>
                                <StyledDescriptionContainer>
                                    No description.{' '}
                                    <PermissionIconButton
                                        size='medium'
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
                            </div>
                        }
                    />
                    <BodyItemWithIcon>
                        <StyledDetailsContainer>
                            <StyledDetail>
                                <StyledLabel>Created at:</StyledLabel>
                                <span>
                                    {formatDateYMD(
                                        parseISO(feature.createdAt),
                                        locationSettings.locale,
                                    )}
                                </span>
                            </StyledDetail>

                            <FeatureEnvironmentSeen
                                featureLastSeen={feature.lastSeenAt}
                                environments={lastSeenEnvironments}
                            />
                        </StyledDetailsContainer>
                    </BodyItemWithIcon>
                    <ConditionallyRender
                        condition={Boolean(feature.createdBy)}
                        show={() => (
                            <BodyItemWithIcon>
                                <StyledDetailsContainer>
                                    <StyledDetail>
                                        <StyledLabel>Created by:</StyledLabel>
                                        <span>{feature.createdBy?.name}</span>
                                    </StyledDetail>
                                    <StyledUserAvatar
                                        user={feature.createdBy}
                                    />
                                </StyledDetailsContainer>
                            </BodyItemWithIcon>
                        )}
                    />
                    <ConditionallyRender
                        condition={showDependentFeatures}
                        show={<DependencyRow feature={feature} />}
                    />
                </StyledBody>
            </StyledPaddingContainerTop>
            <ConditionallyRender
                condition={feature.children.length > 0}
                show={
                    <FeatureArchiveNotAllowedDialog
                        features={feature.children}
                        project={projectId}
                        isOpen={showDelDialog}
                        onClose={() => setShowDelDialog(false)}
                    />
                }
                elseShow={
                    <FeatureArchiveDialog
                        isOpen={showDelDialog}
                        onConfirm={() => {
                            navigate(`/projects/${projectId}`);
                        }}
                        onClose={() => setShowDelDialog(false)}
                        projectId={projectId}
                        featureIds={[featureId]}
                    />
                }
            />
            <ConditionallyRender
                condition={Boolean(feature.project)}
                show={
                    <MarkCompletedDialogue
                        isOpen={showMarkCompletedDialogue}
                        setIsOpen={setShowMarkCompletedDialogue}
                        projectId={feature.project}
                        featureId={feature.name}
                        onComplete={refetchFeature}
                    />
                }
            />
        </StyledContainer>
    );
};

export default FeatureOverviewMetaData;
