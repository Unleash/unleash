import { useState } from 'react';
import {
    IconButton,
    styled,
    Tab,
    Tabs,
    Tooltip,
    useMediaQuery,
} from '@mui/material';
import {
    Archive,
    FileCopy,
    Label,
    WatchLater,
    LibraryAdd,
    Check,
} from '@mui/icons-material';
import {
    Link,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useProject from 'hooks/api/getters/useProject/useProject';
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import FeatureLog from './FeatureLog/FeatureLog';
import FeatureOverview from './FeatureOverview/FeatureOverview';
import { FeatureEnvironmentVariants } from './FeatureVariants/FeatureEnvironmentVariants/FeatureEnvironmentVariants';
import { FeatureMetrics } from './FeatureMetrics/FeatureMetrics';
import { FeatureSettings } from './FeatureSettings/FeatureSettings';
import useLoading from 'hooks/useLoading';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { ManageTagsDialog } from './FeatureOverview/ManageTagsDialog/ManageTagsDialog';
import { FeatureStatusChip } from 'component/common/FeatureStatusChip/FeatureStatusChip';
import { FeatureNotFound } from 'component/feature/FeatureView/FeatureNotFound/FeatureNotFound';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FavoriteIconButton } from 'component/common/FavoriteIconButton/FavoriteIconButton';
import { ReactComponent as ChildLinkIcon } from 'assets/icons/link-child.svg';
import { ReactComponent as ParentLinkIcon } from 'assets/icons/link-parent.svg';
import { ChildrenTooltip } from './FeatureOverview/FeatureOverviewSidePanel/FeatureOverviewSidePanelDetails/ChildrenTooltip';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';

const StyledHeader = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    marginBottom: theme.spacing(2),
}));

const StyledInnerContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 4, 2, 2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down(500)]: {
        flexDirection: 'column',
    },
}));

const StyledToggleInfoContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const StyledDependency = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    fontSize: theme.fontSizes.smallBody,
    padding: theme.spacing(0.75, 1.5),
    backgroundColor: theme.palette.background.elevation2,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    width: 'max-content',
}));

const StyleChildLinkIcon = styled(ChildLinkIcon)(({ theme }) => ({
    width: theme.fontSizes.smallBody,
    height: theme.fontSizes.smallBody,
}));

const StyledParentLinkIcon = styled(ParentLinkIcon)(({ theme }) => ({
    width: theme.fontSizes.smallBody,
    height: theme.fontSizes.smallBody,
}));

const StyledFeatureViewHeader = styled('h1')(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: 'normal',
    display: 'flex',
    alignItems: 'center',
    wordBreak: 'break-all',
}));

const StyledToolbarContainer = styled('div')({
    flexShrink: 0,
    display: 'flex',
});

const StyledSeparator = styled('div')(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.divider,
    height: '1px',
}));

const StyledTabContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
}));

const StyledTabButton = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    width: 'auto',
    fontSize: theme.fontSizes.bodySize,
    padding: '0 !important',
    [theme.breakpoints.up('md')]: {
        minWidth: 160,
    },
}));

export const StyledLink = styled(Link)(({ theme }) => ({
    maxWidth: '100%',
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

export const FeatureView = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { refetch: projectRefetch } = useProject(projectId);
    const { favorite, unfavorite } = useFavoriteFeaturesApi();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setToastData, setToastApiError } = useToast();

    const [openTagDialog, setOpenTagDialog] = useState(false);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [openStaleDialog, setOpenStaleDialog] = useState(false);
    const [isFeatureNameCopied, setIsFeatureNameCopied] = useState(false);
    const smallScreen = useMediaQuery(`(max-width:${500}px)`);

    const { feature, loading, error, status } = useFeature(
        projectId,
        featureId,
    );

    const navigate = useNavigate();
    const { pathname } = useLocation();
    const ref = useLoading(loading);

    const basePath = `/projects/${projectId}/features/${featureId}`;

    const tabData = [
        {
            title: 'Overview',
            path: `${basePath}`,
            name: 'overview',
        },
        {
            title: 'Metrics',
            path: `${basePath}/metrics`,
            name: 'Metrics',
        },
        { title: 'Variants', path: `${basePath}/variants`, name: 'Variants' },
        { title: 'Settings', path: `${basePath}/settings`, name: 'Settings' },
        {
            title: 'Event log',
            path: `${basePath}/logs`,
            name: 'Event log',
        },
    ];

    const activeTab =
        tabData.find((tab) => tab.path === pathname) ?? tabData[0];

    const onFavorite = async () => {
        try {
            if (feature?.favorite) {
                await unfavorite(projectId, feature.name);
            } else {
                await favorite(projectId, feature.name);
            }
            refetchFeature();
        } catch (error) {
            setToastApiError('Something went wrong, could not update favorite');
        }
    };

    if (status === 404) {
        return <FeatureNotFound />;
    }

    if (error !== undefined) {
        return <div ref={ref} />;
    }

    const handleCopyToClipboard = () => {
        try {
            copy(feature.name);
            setIsFeatureNameCopied(true);
            setTimeout(() => {
                setIsFeatureNameCopied(false);
            }, 3000);
        } catch (error: unknown) {
            setToastData({
                type: 'error',
                title: 'Could not copy feature name',
            });
        }
    };

    return (
        <div ref={ref}>
            <StyledHeader>
                <StyledInnerContainer>
                    <StyledToggleInfoContainer>
                        <FavoriteIconButton
                            onClick={onFavorite}
                            isFavorite={feature?.favorite}
                        />
                        <div>
                            <StyledToggleInfoContainer>
                                <StyledFeatureViewHeader data-loading>
                                    {feature.name}{' '}
                                </StyledFeatureViewHeader>
                                <Tooltip
                                    title={
                                        isFeatureNameCopied
                                            ? 'Copied!'
                                            : 'Copy name'
                                    }
                                    arrow
                                >
                                    <IconButton
                                        onClick={handleCopyToClipboard}
                                        style={{ marginLeft: 8 }}
                                    >
                                        {isFeatureNameCopied ? (
                                            <Check style={{ fontSize: 16 }} />
                                        ) : (
                                            <FileCopy
                                                style={{ fontSize: 16 }}
                                            />
                                        )}
                                    </IconButton>
                                </Tooltip>
                                <ConditionallyRender
                                    condition={!smallScreen}
                                    show={
                                        <FeatureStatusChip
                                            stale={feature?.stale}
                                        />
                                    }
                                />
                            </StyledToggleInfoContainer>
                            <ConditionallyRender
                                condition={feature.dependencies.length > 0}
                                show={
                                    <StyledDependency>
                                        <b>Has parent: </b>
                                        <StyledLink
                                            to={`/projects/${feature.project}/features/${feature?.dependencies[0]?.feature}`}
                                        >
                                            {feature?.dependencies[0]?.feature}
                                        </StyledLink>
                                    </StyledDependency>
                                }
                            />
                            <ConditionallyRender
                                condition={feature.children.length > 0}
                                show={
                                    <StyledDependency>
                                        <b>Has children:</b>
                                        <ChildrenTooltip
                                            childFeatures={feature.children}
                                            project={feature.project}
                                        />
                                    </StyledDependency>
                                }
                            />
                        </div>
                    </StyledToggleInfoContainer>

                    <StyledToolbarContainer>
                        <PermissionIconButton
                            permission={CREATE_FEATURE}
                            projectId={projectId}
                            data-loading
                            component={Link}
                            to={`/projects/${projectId}/features/${featureId}/copy`}
                            tooltipProps={{
                                title: 'Clone',
                            }}
                        >
                            <LibraryAdd />
                        </PermissionIconButton>
                        <PermissionIconButton
                            permission={DELETE_FEATURE}
                            projectId={projectId}
                            tooltipProps={{
                                title: 'Archive feature toggle',
                            }}
                            data-loading
                            onClick={() => setShowDelDialog(true)}
                        >
                            <Archive />
                        </PermissionIconButton>
                        <PermissionIconButton
                            onClick={() => setOpenStaleDialog(true)}
                            permission={UPDATE_FEATURE}
                            projectId={projectId}
                            tooltipProps={{
                                title: 'Toggle stale state',
                            }}
                            data-loading
                        >
                            <WatchLater />
                        </PermissionIconButton>
                        <PermissionIconButton
                            onClick={() => setOpenTagDialog(true)}
                            permission={UPDATE_FEATURE}
                            projectId={projectId}
                            tooltipProps={{ title: 'Add tag' }}
                            data-loading
                        >
                            <Label />
                        </PermissionIconButton>
                    </StyledToolbarContainer>
                </StyledInnerContainer>
                <StyledSeparator />
                <StyledTabContainer>
                    <Tabs
                        value={activeTab.path}
                        indicatorColor='primary'
                        textColor='primary'
                    >
                        {tabData.map((tab) => (
                            <StyledTabButton
                                key={tab.title}
                                label={tab.title}
                                value={tab.path}
                                onClick={() => navigate(tab.path)}
                                data-testid={`TAB-${tab.title}`}
                            />
                        ))}
                    </Tabs>
                </StyledTabContainer>
            </StyledHeader>
            <Routes>
                <Route path='metrics' element={<FeatureMetrics />} />
                <Route path='logs' element={<FeatureLog />} />
                <Route
                    path='variants'
                    element={<FeatureEnvironmentVariants />}
                />
                <Route path='settings' element={<FeatureSettings />} />
                <Route path='*' element={<FeatureOverview />} />
            </Routes>
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
                            projectRefetch();
                            navigate(`/projects/${projectId}`);
                        }}
                        onClose={() => setShowDelDialog(false)}
                        projectId={projectId}
                        featureIds={[featureId]}
                    />
                }
            />

            <FeatureStaleDialog
                isStale={feature.stale}
                isOpen={openStaleDialog}
                onClose={() => {
                    setOpenStaleDialog(false);
                    refetchFeature();
                }}
                featureId={featureId}
                projectId={projectId}
            />
            <ManageTagsDialog open={openTagDialog} setOpen={setOpenTagDialog} />
        </div>
    );
};
