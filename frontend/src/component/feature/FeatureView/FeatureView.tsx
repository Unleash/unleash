import { useState } from 'react';
import { styled, Tab, Tabs, useMediaQuery, Box, Card } from '@mui/material';
import { Archive, FileCopy, Label, WatchLater } from '@mui/icons-material';
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
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FavoriteIconButton } from 'component/common/FavoriteIconButton/FavoriteIconButton';
import { ReactComponent as ChildLinkIcon } from 'assets/icons/link-child.svg';
import { ReactComponent as ParentLinkIcon } from 'assets/icons/link-parent.svg';
import { TooltipLink } from '../../common/TooltipLink/TooltipLink';
import { ChildrenTooltip } from './FeatureOverview/FeatureOverviewSidePanel/FeatureOverviewSidePanelDetails/ChildrenTooltip';

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

    const [openTagDialog, setOpenTagDialog] = useState(false);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [openStaleDialog, setOpenStaleDialog] = useState(false);
    const smallScreen = useMediaQuery(`(max-width:${500}px)`);

    const { feature, loading, error, status } = useFeature(
        projectId,
        featureId
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

    const activeTab = tabData.find(tab => tab.path === pathname) ?? tabData[0];

    const onFavorite = async () => {
        if (feature?.favorite) {
            await unfavorite(projectId, feature.name);
        } else {
            await favorite(projectId, feature.name);
        }
        refetchFeature();
    };

    if (status === 404) {
        return <FeatureNotFound />;
    }

    if (error !== undefined) {
        return <div ref={ref} />;
    }

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
                                condition={
                                    Boolean(feature.dependencies) &&
                                    feature.dependencies.length > 0
                                }
                                show={
                                    <StyledDependency>
                                        <StyleChildLinkIcon />{' '}
                                        <b>Child feature</b>
                                        <span>{' < '}</span>
                                        <StyledLink
                                            to={`/projects/${feature.project}/features/${feature?.dependencies[0]?.feature}`}
                                        >
                                            {feature?.dependencies[0]?.feature}
                                        </StyledLink>
                                    </StyledDependency>
                                }
                            />
                            <ConditionallyRender
                                condition={
                                    Boolean(feature.children) &&
                                    feature.children.length > 0
                                }
                                show={
                                    <StyledDependency>
                                        <StyledParentLinkIcon />{' '}
                                        <b>Parent feature</b>
                                        <span>{' > '}</span>
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
                            to={`/projects/${projectId}/features/${featureId}/strategies/copy`}
                            tooltipProps={{
                                title: 'Copy feature toggle',
                            }}
                        >
                            <FileCopy />
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
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        {tabData.map(tab => (
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
                <Route path="metrics" element={<FeatureMetrics />} />
                <Route path="logs" element={<FeatureLog />} />
                <Route
                    path="variants"
                    element={<FeatureEnvironmentVariants />}
                />
                <Route path="settings" element={<FeatureSettings />} />
                <Route path="*" element={<FeatureOverview />} />
            </Routes>
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
