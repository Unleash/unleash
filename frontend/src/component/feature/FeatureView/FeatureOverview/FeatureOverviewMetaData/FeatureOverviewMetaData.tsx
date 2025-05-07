import { type FC, useState } from 'react';
import {
    Button,
    List,
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
import { DependencyRow } from './DependencyRow';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useShowDependentFeatures } from './useShowDependentFeatures';
import { FeatureLifecycle } from '../FeatureLifecycle/FeatureLifecycle';
import { MarkCompletedDialogue } from '../FeatureLifecycle/MarkCompletedDialogue';
import { TagRow } from './TagRow';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { Collaborators } from './Collaborators';
import { EnvironmentVisibilityMenu } from './EnvironmentVisibilityMenu/EnvironmentVisibilityMenu';
import { Truncator } from 'component/common/Truncator/Truncator';
import type {
    FeatureLink,
    IFeatureToggle,
} from '../../../../../interfaces/featureToggle';
import AddIcon from '@mui/icons-material/Add';
import { useUiFlag } from 'hooks/useUiFlag';
import { Badge } from 'component/common/Badge/Badge';
import LinkIcon from '@mui/icons-material/Link';

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

const FeatureLinks: FC<{ links: FeatureLink[] }> = ({ links }) => {
    return links.length === 0 ? (
        <StyledMetaDataContainer>
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
            <div>
                <Button
                    size='small'
                    variant='text'
                    startIcon={<AddIcon />}
                    onClick={() => {}}
                >
                    Add link
                </Button>
            </div>
        </StyledMetaDataContainer>
    ) : (
        <StyledMetaDataContainer>
            <StyledTitle>Resources</StyledTitle>
            <List>
                {links.map((link) => (
                    <ListItemButton
                        component='a'
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
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
                ))}
            </List>

            <div>
                <Button
                    size='small'
                    variant='text'
                    startIcon={<AddIcon />}
                    onClick={() => {}}
                >
                    Add link
                </Button>
            </div>
        </StyledMetaDataContainer>
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

    const featureLinksEnabled = useUiFlag('featureLinks');

    return (
        <>
            {featureLinksEnabled ? (
                <FeatureLinks links={feature.links || []} />
            ) : null}
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
