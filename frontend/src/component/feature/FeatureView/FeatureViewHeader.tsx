import { type PropsWithChildren, useState, type FC } from 'react';
import {
    IconButton,
    styled,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import Archive from '@mui/icons-material/Archive';
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import FileCopy from '@mui/icons-material/FileCopy';
import FileCopyOutlined from '@mui/icons-material/FileCopyOutlined';
import Label from '@mui/icons-material/Label';
import WatchLater from '@mui/icons-material/WatchLater';
import WatchLaterOutlined from '@mui/icons-material/WatchLaterOutlined';
import LibraryAdd from '@mui/icons-material/LibraryAdd';
import LibraryAddOutlined from '@mui/icons-material/LibraryAddOutlined';
import Check from '@mui/icons-material/Check';
import Star from '@mui/icons-material/Star';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureStatusChip } from 'component/common/FeatureStatusChip/FeatureStatusChip';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FavoriteIconButton } from 'component/common/FavoriteIconButton/FavoriteIconButton';
import { ChildrenTooltip } from './FeatureOverview/FeatureOverviewMetaData/ChildrenTooltip';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import { useUiFlag } from 'hooks/useUiFlag';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { Collaborators } from './Collaborators';
import StarBorder from '@mui/icons-material/StarBorder';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { ManageTagsDialog } from './FeatureOverview/ManageTagsDialog/ManageTagsDialog';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';

const NewStyledHeader = styled('div')(({ theme }) => ({
    backgroundColor: 'none',
    marginBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    containerType: 'inline-size',
}));

const onNarrowHeader = (css: object) => ({
    '@container (max-width: 650px)': css,
    '@supports not (container-type: inline-size)': {
        '@media (max-width: 700px)': css,
    },
});

const UpperHeaderRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    columnGap: theme.spacing(4),
    alignItems: 'center',
}));

const LowerHeaderRow = styled(UpperHeaderRow)(({ theme }) => ({
    justifyContent: 'space-between',
    ...onNarrowHeader({ flexFlow: 'column nowrap', alignItems: 'flex-start' }),
}));

const HeaderActions = styled('div', {
    shouldForwardProp: (propName) => propName !== 'showOnNarrowScreens',
})<{ showOnNarrowScreens?: boolean }>(({ theme, showOnNarrowScreens }) => ({
    display: showOnNarrowScreens ? 'none' : 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',

    ...onNarrowHeader({
        display: showOnNarrowScreens ? 'flex' : 'none',
    }),
}));

const IconButtonWithTooltip: FC<
    PropsWithChildren<{
        onClick: () => void;
        label: string;
    }>
> = ({ children, label, onClick }) => {
    return (
        <TooltipResolver
            title={label}
            arrow
            onClick={(e) => e.preventDefault()}
        >
            <IconButton aria-label={label} onClick={onClick}>
                {children}
            </IconButton>
        </TooltipResolver>
    );
};

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

const StyledFlagInfoContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    columnGap: theme.spacing(1),
}));

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

const StyledTabRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row nowrap',
    gap: theme.spacing(4),
    paddingInline: theme.spacing(4),
    justifyContent: 'space-between',
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

export const StyledLink = styled(Link)(() => ({
    maxWidth: '100%',
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const useLegacyVariants = (environments: IFeatureToggle['environments']) => {
    const enableLegacyVariants = useUiFlag('enableLegacyVariants');
    const existingLegacyVariantsExist = environments.some(
        (environment) => environment.variants?.length,
    );
    return enableLegacyVariants || existingLegacyVariantsExist;
};

type HeaderActionsProps = {
    feature: IFeatureToggle;
    showOnNarrowScreens?: boolean;
    onFavorite: () => void;
    handleCopyToClipboard: () => void;
    isFeatureNameCopied: boolean;
    openStaleDialog: () => void;
    openDeleteDialog: () => void;
};

const HeaderActionsComponent = ({
    showOnNarrowScreens,
    feature,
    onFavorite,
    handleCopyToClipboard,
    isFeatureNameCopied,
    openStaleDialog,
    openDeleteDialog,
}: HeaderActionsProps) => (
    <HeaderActions showOnNarrowScreens={showOnNarrowScreens}>
        <IconButtonWithTooltip
            label='Favorite this feature flag'
            onClick={onFavorite}
            data-loading
        >
            {feature.favorite ? <Star /> : <StarBorder />}
        </IconButtonWithTooltip>

        <IconButtonWithTooltip
            label='Copy flag name'
            onClick={handleCopyToClipboard}
            data-loading
        >
            {isFeatureNameCopied ? <Check /> : <FileCopyOutlined />}
        </IconButtonWithTooltip>
        <PermissionIconButton
            permission={CREATE_FEATURE}
            projectId={feature.project}
            data-loading
            component={Link}
            to={`/projects/${feature.project}/features/${feature.name}/copy`}
            tooltipProps={{
                title: 'Clone',
            }}
        >
            <LibraryAddOutlined />
        </PermissionIconButton>

        <PermissionIconButton
            permission={DELETE_FEATURE}
            projectId={feature.project}
            tooltipProps={{
                title: 'Archive feature flag',
            }}
            data-loading
            onClick={openDeleteDialog}
        >
            <ArchiveOutlined />
        </PermissionIconButton>
        <PermissionIconButton
            onClick={openStaleDialog}
            permission={UPDATE_FEATURE}
            projectId={feature.project}
            tooltipProps={{
                title: 'Toggle stale state',
            }}
            data-loading
        >
            <WatchLaterOutlined />
        </PermissionIconButton>
    </HeaderActions>
);

type Props = {
    feature: IFeatureToggle;
};

export const FeatureViewHeader: FC<Props> = ({ feature }) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign');
    const { favorite, unfavorite } = useFavoriteFeaturesApi();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setToastData, setToastApiError } = useToast();

    const [openTagDialog, setOpenTagDialog] = useState(false);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [openStaleDialog, setOpenStaleDialog] = useState(false);

    const [isFeatureNameCopied, setIsFeatureNameCopied] = useState(false);
    const smallScreen = useMediaQuery(`(max-width:${500}px)`);

    const navigate = useNavigate();

    const { pathname } = useLocation();

    const basePath = `/projects/${projectId}/features/${featureId}`;

    const showLegacyVariants = useLegacyVariants(feature.environments);

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
        ...(showLegacyVariants
            ? [
                  {
                      title: 'Variants',
                      path: `${basePath}/variants`,
                      name: 'Variants',
                  },
              ]
            : []),
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
            if (feature.favorite) {
                await unfavorite(projectId, feature.name);
            } else {
                await favorite(projectId, feature.name);
            }
            refetchFeature();
        } catch (error) {
            setToastApiError('Something went wrong, could not update favorite');
        }
    };

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
                text: 'Could not copy feature name',
            });
        }
    };

    const HeaderActionsInner: FC<{ showOnNarrowScreens?: boolean }> = ({
        showOnNarrowScreens,
    }) => {
        return (
            <HeaderActionsComponent
                showOnNarrowScreens={showOnNarrowScreens}
                feature={feature}
                onFavorite={onFavorite}
                handleCopyToClipboard={handleCopyToClipboard}
                isFeatureNameCopied={isFeatureNameCopied}
                openStaleDialog={() => setOpenStaleDialog(true)}
                openDeleteDialog={() => setShowDelDialog(true)}
            />
        );
    };

    return (
        <>
            {flagOverviewRedesign ? (
                <NewStyledHeader>
                    <UpperHeaderRow>
                        <Typography variant='h1'>{feature.name}</Typography>
                        {feature.stale ? (
                            <FeatureStatusChip stale={true} />
                        ) : null}
                    </UpperHeaderRow>
                    <LowerHeaderRow>
                        <HeaderActionsInner showOnNarrowScreens />
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
                        <HeaderActionsInner />
                    </LowerHeaderRow>
                </NewStyledHeader>
            ) : (
                <StyledHeader>
                    <StyledInnerContainer>
                        <StyledFlagInfoContainer>
                            <FavoriteIconButton
                                onClick={onFavorite}
                                isFavorite={feature.favorite}
                            />
                            <div>
                                <StyledFlagInfoContainer>
                                    <StyledFeatureViewHeader data-loading>
                                        {feature.name}
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
                                        >
                                            {isFeatureNameCopied ? (
                                                <Check
                                                    style={{ fontSize: 16 }}
                                                />
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
                                                stale={feature.stale}
                                            />
                                        }
                                    />
                                </StyledFlagInfoContainer>
                                <ConditionallyRender
                                    condition={feature.dependencies.length > 0}
                                    show={
                                        <StyledDependency>
                                            <b>Has parent: </b>
                                            <StyledLink
                                                to={`/projects/${feature.project}/features/${feature.dependencies[0]?.feature}`}
                                            >
                                                {
                                                    feature.dependencies[0]
                                                        ?.feature
                                                }
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
                        </StyledFlagInfoContainer>

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
                                    title: 'Archive feature flag',
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
                    <StyledTabRow>
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
                        <Collaborators
                            collaborators={feature.collaborators?.users}
                        />
                    </StyledTabRow>
                </StyledHeader>
            )}

            {feature.children.length > 0 ? (
                <FeatureArchiveNotAllowedDialog
                    features={feature.children}
                    project={projectId}
                    isOpen={showDelDialog}
                    onClose={() => setShowDelDialog(false)}
                />
            ) : (
                <FeatureArchiveDialog
                    isOpen={showDelDialog}
                    onConfirm={() => {
                        navigate(`/projects/${projectId}`);
                    }}
                    onClose={() => setShowDelDialog(false)}
                    projectId={projectId}
                    featureIds={[featureId]}
                />
            )}

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
        </>
    );
};
