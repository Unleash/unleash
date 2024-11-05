import { capitalize, styled } from '@mui/material';
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
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { DependencyRow } from './DependencyRow';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useShowDependentFeatures } from './useShowDependentFeatures';
import { FeatureLifecycle } from '../FeatureLifecycle/FeatureLifecycle';
import { MarkCompletedDialogue } from '../FeatureLifecycle/MarkCompletedDialogue';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { TagRow } from './TagRow';

const StyledMetaDataContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '350px',
    [theme.breakpoints.down(1000)]: {
        width: '100%',
    },
}));

const StyledMetaDataHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    '& > svg': {
        height: theme.spacing(5),
        width: theme.spacing(5),
        padding: theme.spacing(0.5),
        backgroundColor: theme.palette.background.alternative,
        fill: theme.palette.primary.contrastText,
        borderRadius: theme.shape.borderRadiusMedium,
    },
    '& > h2': {
        fontSize: theme.fontSizes.mainHeader,
        fontWeight: 'normal',
    },
}));

const StyledBody = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

export const StyledMetaDataItem = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: theme.spacing(4.25),
    fontSize: theme.fontSizes.smallBody,
}));

export const StyledMetaDataItemLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
}));

const StyledMetaDataItemText = styled('span')({
    overflowWrap: 'anywhere',
});

export const StyledMetaDataItemValue = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledIconButton = styled(PermissionIconButton)(({ theme }) => ({
    height: theme.spacing(3.5),
    width: theme.spacing(3.5),
}));

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    height: theme.spacing(3.5),
    width: theme.spacing(3.5),
}));

const FeatureOverviewMetaData = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature } = useFeature(projectId, featureId);

    const { locationSettings } = useLocationSettings();
    const navigate = useNavigate();

    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [markCompletedDialogueOpen, setMarkCompletedDialogueOpen] =
        useState(false);

    const { project, description, type } = feature;

    const showDependentFeatures = useShowDependentFeatures(project);

    const FlagTypeIcon = getFeatureTypeIcons(type);

    return (
        <>
            <StyledMetaDataContainer>
                <StyledMetaDataHeader data-loading>
                    <FlagTypeIcon />
                    <h2>{capitalize(type || '')} flag</h2>
                </StyledMetaDataHeader>
                <StyledMetaDataItem data-loading>
                    <StyledMetaDataItemText>
                        {description ? description : <i>No description</i>}
                    </StyledMetaDataItemText>
                    <StyledIconButton
                        projectId={projectId}
                        permission={UPDATE_FEATURE}
                        component={Link}
                        to={`/projects/${projectId}/features/${featureId}/settings`}
                        tooltipProps={{
                            title: 'Edit description',
                        }}
                    >
                        <Edit />
                    </StyledIconButton>
                </StyledMetaDataItem>
                <StyledBody>
                    <StyledMetaDataItem>
                        <StyledMetaDataItemLabel>
                            Project:
                        </StyledMetaDataItemLabel>
                        <StyledMetaDataItemText data-loading>
                            {project}
                        </StyledMetaDataItemText>
                    </StyledMetaDataItem>
                    <ConditionallyRender
                        condition={Boolean(feature.lifecycle)}
                        show={
                            <StyledMetaDataItem data-loading>
                                <StyledMetaDataItemLabel>
                                    Lifecycle:
                                </StyledMetaDataItemLabel>
                                <FeatureLifecycle
                                    feature={feature}
                                    onArchive={() => setArchiveDialogOpen(true)}
                                    onComplete={() =>
                                        setMarkCompletedDialogueOpen(true)
                                    }
                                    onUncomplete={refetchFeature}
                                />
                            </StyledMetaDataItem>
                        }
                    />
                    <StyledMetaDataItem>
                        <StyledMetaDataItemLabel>
                            Created at:
                        </StyledMetaDataItemLabel>
                        <StyledMetaDataItemText data-loading>
                            {formatDateYMD(
                                parseISO(feature.createdAt),
                                locationSettings.locale,
                            )}
                        </StyledMetaDataItemText>
                    </StyledMetaDataItem>
                    <ConditionallyRender
                        condition={Boolean(feature.createdBy)}
                        show={() => (
                            <StyledMetaDataItem>
                                <StyledMetaDataItemLabel>
                                    Created by:
                                </StyledMetaDataItemLabel>
                                <StyledMetaDataItemValue>
                                    <StyledMetaDataItemText data-loading>
                                        {feature.createdBy?.name}
                                    </StyledMetaDataItemText>
                                    <StyledUserAvatar
                                        user={feature.createdBy}
                                    />
                                </StyledMetaDataItemValue>
                            </StyledMetaDataItem>
                        )}
                    />
                    <ConditionallyRender
                        condition={showDependentFeatures}
                        show={<DependencyRow feature={feature} />}
                    />
                    <TagRow feature={feature} />
                </StyledBody>
            </StyledMetaDataContainer>
            <ConditionallyRender
                condition={feature.children.length > 0}
                show={
                    <FeatureArchiveNotAllowedDialog
                        features={feature.children}
                        project={projectId}
                        isOpen={archiveDialogOpen}
                        onClose={() => setArchiveDialogOpen(false)}
                    />
                }
                elseShow={
                    <FeatureArchiveDialog
                        isOpen={archiveDialogOpen}
                        onConfirm={() => {
                            navigate(`/projects/${projectId}`);
                        }}
                        onClose={() => setArchiveDialogOpen(false)}
                        projectId={projectId}
                        featureIds={[featureId]}
                    />
                }
            />
            <ConditionallyRender
                condition={Boolean(feature.project)}
                show={
                    <MarkCompletedDialogue
                        isOpen={markCompletedDialogueOpen}
                        setIsOpen={setMarkCompletedDialogueOpen}
                        projectId={feature.project}
                        featureId={feature.name}
                        onComplete={refetchFeature}
                    />
                }
            />
        </>
    );
};

export default FeatureOverviewMetaData;
