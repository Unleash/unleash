import { type FC, useState } from 'react';
import { styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { DependencyRow } from './DependencyRow';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useShowDependentFeatures } from './useShowDependentFeatures';
import { FeatureLifecycle } from '../FeatureLifecycle/FeatureLifecycle';
import { MarkCompletedDialogue } from '../FeatureLifecycle/MarkCompletedDialogue';
import { TagRow } from './TagRow';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { Collaborators } from './Collaborators';
import { EnvironmentVisibilityMenu } from './EnvironmentVisibilityMenu/EnvironmentVisibilityMenu';

const StyledMetaDataContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '350px',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down(1000)]: {
        width: '100%',
    },
}));

const StyledTitle = styled('h2')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(0.5),
}));

const StyledBody = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

export const StyledMetaDataItem = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: theme.spacing(4.5),
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

type FeatureOverviewMetaDataProps = {
    hiddenEnvironments: string[];
    onEnvironmentVisibilityChange: (environment: string) => void;
};

const FeatureOverviewMetaData: FC<FeatureOverviewMetaDataProps> = ({
    hiddenEnvironments,
    onEnvironmentVisibilityChange,
}) => {
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
                            {capitalizeFirst(type || ' ')} flag
                        </StyledMetaDataItemText>
                    </StyledMetaDataItem>
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
                            </StyledMetaDataItemValue>
                        </StyledMetaDataItem>
                    ) : null}
                    {feature.collaborators?.users &&
                    feature.collaborators?.users.length > 0 ? (
                        <StyledMetaDataItem>
                            <StyledMetaDataItemLabel>
                                Collaborators:
                            </StyledMetaDataItemLabel>
                            <StyledMetaDataItemValue>
                                <Collaborators
                                    collaborators={feature.collaborators?.users}
                                />
                            </StyledMetaDataItemValue>
                        </StyledMetaDataItem>
                    ) : null}
                    {showDependentFeatures ? (
                        <DependencyRow feature={feature} />
                    ) : null}
                    <TagRow feature={feature} />
                    <EnvironmentVisibilityMenu
                        environments={feature.environments || []}
                        hiddenEnvironments={hiddenEnvironments}
                        onChange={onEnvironmentVisibilityChange}
                    />
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
