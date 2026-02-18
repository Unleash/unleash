import { type FC, useState } from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { DependencyRow } from './DependencyRow.tsx';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useShowDependentFeatures } from './useShowDependentFeatures.ts';
import { FeatureLifecycle } from '../FeatureLifecycle/FeatureLifecycle.tsx';
import { MarkCompletedDialogue } from '../FeatureLifecycle/MarkCompletedDialogue.tsx';
import { TagRow } from './TagRow.tsx';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { Collaborators } from './Collaborators.tsx';
import { EnvironmentVisibilityMenu } from './EnvironmentVisibilityMenu/EnvironmentVisibilityMenu.tsx';
import { Truncator } from 'component/common/Truncator/Truncator';
import type {
    FeatureLink,
    IFeatureToggle,
} from '../../../../../interfaces/featureToggle.ts';
import AddIcon from '@mui/icons-material/Add';
import { Badge } from 'component/common/Badge/Badge';
import LinkIcon from '@mui/icons-material/Link';
import { UPDATE_FEATURE } from '../../../../providers/AccessProvider/permissions.ts';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { EditLinkDialogue, AddLinkDialogue } from './LinkDialogue.tsx';
import { useFeatureLinkApi } from 'hooks/api/actions/useFeatureLinkApi/useFeatureLinkApi';
import useToast from 'hooks/useToast';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ExtraActions } from './ExtraActions.tsx';

const StyledMetaDataContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '350px',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('md')]: {
        width: '100%',
    },
    marginBottom: theme.spacing(2),
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

export const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
    minWidth: theme.spacing(5),
}));

type FeatureOverviewMetaDataProps = {
    hiddenEnvironments?: string[];
    onEnvironmentVisibilityChange?: (environment: string) => void;
    feature: IFeatureToggle;
    onChange: () => void;
};

interface FeatureLinksProps {
    links: FeatureLink[];
    project: string;
    feature: string;
}

const FeatureLinks: FC<FeatureLinksProps> = ({ links, project, feature }) => {
    const [showAddLinkDialogue, setShowAddLinkDialogue] = useState(false);
    const [editLink, setEditLink] = useState<FeatureLink | null>(null);
    const { deleteLink } = useFeatureLinkApi(project, feature);
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(project, feature);

    const addLinkButton = (
        <PermissionButton
            size='small'
            startIcon={<AddIcon />}
            permission={UPDATE_FEATURE}
            disabled={links.length >= 10}
            projectId={project}
            variant='text'
            onClick={() => setShowAddLinkDialogue(true)}
        >
            Add link
        </PermissionButton>
    );

    const renderLinkItems = () => (
        <List>
            {links.map((link) => (
                <ListItem
                    secondaryAction={
                        <ExtraActions
                            capabilityId='link'
                            feature={feature}
                            onEdit={() => {
                                setEditLink(link);
                            }}
                            onDelete={async () => {
                                try {
                                    await deleteLink(link.id);
                                    setToastData({
                                        text: 'Link removed',
                                        type: 'success',
                                    });
                                    refetchFeature();
                                } catch (error) {
                                    setToastApiError(formatUnknownError(error));
                                }
                            }}
                        />
                    }
                    key={link.id}
                    disablePadding
                    dense
                >
                    <ListItemButton
                        component='a'
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        disableGutters
                    >
                        <StyledListItemIcon>
                            <LinkIcon color='primary' />
                        </StyledListItemIcon>
                        <ListItemText
                            primary={link.title}
                            secondary={link.url}
                            secondaryTypographyProps={{
                                sx: {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block',
                                },
                            }}
                        />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );

    const emptyStateContent = (
        <>
            <StyledTitle>
                You can now add links{' '}
                <Badge color='success' sx={{ ml: 1 }}>
                    New
                </Badge>
            </StyledTitle>
            <StyledMetaDataItem>
                Gather relevant links for external resources such as issue
                trackers, code repositories or analytics tooling
            </StyledMetaDataItem>
            <div>{addLinkButton}</div>
        </>
    );

    const linksContent = (
        <>
            <StyledTitle>Resources</StyledTitle>
            {renderLinkItems()}
            <div>{addLinkButton}</div>
        </>
    );

    return (
        <>
            <StyledMetaDataContainer>
                {links.length === 0 ? emptyStateContent : linksContent}
            </StyledMetaDataContainer>

            <AddLinkDialogue
                project={project}
                featureId={feature}
                showDialogue={showAddLinkDialogue}
                onClose={() => setShowAddLinkDialogue(false)}
            />
            <EditLinkDialogue
                project={project}
                featureId={feature}
                link={editLink}
                onClose={() => setEditLink(null)}
            />
        </>
    );
};

const FeatureOverviewMetaData: FC<FeatureOverviewMetaDataProps> = ({
    hiddenEnvironments,
    onEnvironmentVisibilityChange,
    feature,
    onChange,
}) => {
    const { locationSettings } = useLocationSettings();
    const navigate = useNavigate();

    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [markCompletedDialogueOpen, setMarkCompletedDialogueOpen] =
        useState(false);

    const { project, description, type } = feature;

    const showDependentFeatures = useShowDependentFeatures(project);

    return (
        <>
            <FeatureLinks
                links={feature.links || []}
                project={feature.project}
                feature={feature.name}
            />
            <StyledMetaDataContainer>
                <div>
                    <StyledTitle>Flag details</StyledTitle>
                    {description ? (
                        <StyledMetaDataItem data-loading>
                            <StyledMetaDataItemText>
                                <Truncator arrow lines={5} title={description}>
                                    {description}
                                </Truncator>
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
                                onUncomplete={onChange}
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
                    {onEnvironmentVisibilityChange ? (
                        <EnvironmentVisibilityMenu
                            environments={feature.environments || []}
                            hiddenEnvironments={hiddenEnvironments || []}
                            onChange={onEnvironmentVisibilityChange}
                        />
                    ) : null}
                </StyledBody>
            </StyledMetaDataContainer>
            {feature.children.length > 0 ? (
                <FeatureArchiveNotAllowedDialog
                    features={feature.children}
                    project={feature.project}
                    isOpen={archiveDialogOpen}
                    onClose={() => setArchiveDialogOpen(false)}
                />
            ) : (
                <FeatureArchiveDialog
                    isOpen={archiveDialogOpen}
                    onConfirm={() => {
                        navigate(`/projects/${feature.project}`);
                    }}
                    onClose={() => setArchiveDialogOpen(false)}
                    projectId={feature.project}
                    featureIds={[feature.name]}
                />
            )}
            {feature.project ? (
                <MarkCompletedDialogue
                    isOpen={markCompletedDialogueOpen}
                    setIsOpen={setMarkCompletedDialogueOpen}
                    projectId={feature.project}
                    featureId={feature.name}
                    onComplete={onChange}
                />
            ) : null}
        </>
    );
};

export default FeatureOverviewMetaData;
