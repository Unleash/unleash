import { styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
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
import { CreateFeatureSchemaType } from 'openapi';
import { capitalizeFirst } from 'utils/capitalizeFirst';

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

const StyledTitle = styled('h2')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
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

    return (
        <>
            <StyledMetaDataContainer>
                <div>
                    <StyledTitle>Flag details</StyledTitle>
                    {description ? (
                        <StyledMetaDataItem data-loading>
                            <StyledMetaDataItemText>
                                {description}
                            </StyledMetaDataItemText>
                        </StyledMetaDataItem>
                    ) : null}
                </div>
                <StyledBody>
                    <StyledMetaDataItem>
                        <StyledMetaDataItemLabel>
                            Flag type:
                        </StyledMetaDataItemLabel>
                        <StyledMetaDataItemText data-loading>
                            {capitalizeFirst(type)} flag
                        </StyledMetaDataItemText>
                    </StyledMetaDataItem>
                    {/* <StyledMetaDataItem>
                        <StyledMetaDataItemLabel>
                            Project:
                        </StyledMetaDataItemLabel>
                        <StyledMetaDataItemText data-loading>
                            {project}
                        </StyledMetaDataItemText>
                    </StyledMetaDataItem> */}
                    {feature.lifecycle ? (
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
                    ) : null}
                    <StyledMetaDataItem>
                        <StyledMetaDataItemLabel>
                            Created:
                        </StyledMetaDataItemLabel>
                        <StyledMetaDataItemText data-loading>
                            {formatDateYMD(
                                parseISO(feature.createdAt),
                                locationSettings.locale,
                            )}
                        </StyledMetaDataItemText>
                    </StyledMetaDataItem>
                    {feature.createdBy ? (
                        <StyledMetaDataItem>
                            <StyledMetaDataItemLabel>
                                Created by:
                            </StyledMetaDataItemLabel>
                            <StyledMetaDataItemValue>
                                <StyledMetaDataItemText data-loading>
                                    {feature.createdBy?.name}
                                </StyledMetaDataItemText>
                                {/* <StyledUserAvatar user={feature.createdBy} /> */}
                            </StyledMetaDataItemValue>
                        </StyledMetaDataItem>
                    ) : null}
                    {showDependentFeatures ? (
                        <DependencyRow feature={feature} />
                    ) : null}
                    <TagRow feature={feature} />
                </StyledBody>
            </StyledMetaDataContainer>
            {feature.children.length > 0 ? (
                <FeatureArchiveNotAllowedDialog
                    features={feature.children}
                    project={projectId}
                    isOpen={archiveDialogOpen}
                    onClose={() => setArchiveDialogOpen(false)}
                />
            ) : (
                <FeatureArchiveDialog
                    isOpen={archiveDialogOpen}
                    onConfirm={() => {
                        navigate(`/projects/${projectId}`);
                    }}
                    onClose={() => setArchiveDialogOpen(false)}
                    projectId={projectId}
                    featureIds={[featureId]}
                />
            )}
            {feature.project ? (
                <MarkCompletedDialogue
                    isOpen={markCompletedDialogueOpen}
                    setIsOpen={setMarkCompletedDialogueOpen}
                    projectId={feature.project}
                    featureId={feature.name}
                    onComplete={refetchFeature}
                />
            ) : null}
        </>
    );
};

export default FeatureOverviewMetaData;
