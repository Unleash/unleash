import { type PropsWithChildren, useState, type FC } from 'react';
import {
    IconButton,
    styled,
    Tab,
    Tabs,
    type Theme,
    Typography,
} from '@mui/material';
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import WatchLaterOutlined from '@mui/icons-material/WatchLaterOutlined';
import LibraryAddOutlined from '@mui/icons-material/LibraryAddOutlined';
import Star from '@mui/icons-material/Star';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { FeatureStatusChip } from 'component/common/FeatureStatusChip/FeatureStatusChip';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import useToast from 'hooks/useToast';
import { useUiFlag } from 'hooks/useUiFlag';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import StarBorder from '@mui/icons-material/StarBorder';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { ManageTagsDialog } from './FeatureOverview/ManageTagsDialog/ManageTagsDialog.tsx';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';
import { FeatureCopyName } from './FeatureCopyName/FeatureCopyName.tsx';

const StyledHeader = styled('div')(({ theme }) => ({
    backgroundColor: 'none',
    marginBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    containerType: 'inline-size',
}));

const onWideHeader = (theme: Theme, css: object) => ({
    '@container (min-width: 650px)': css,
    '@supports not (container-type: inline-size)': {
        [theme.breakpoints.up('md')]: css,
    },
});

const UpperHeaderRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
    columnGap: theme.spacing(1.5),
}));

const StyledTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    columnGap: theme.spacing(0.5),
}));

const LowerHeaderRow = styled(UpperHeaderRow)(({ theme }) => ({
    justifyContent: 'space-between',
    columnGap: 0,
    flexFlow: 'column nowrap',
    alignItems: 'flex-start',
    ...onWideHeader(theme, {
        alignItems: 'center',
        flexFlow: 'row nowrap',
    }),
}));

const HeaderActions = styled('div', {
    shouldForwardProp: (propName) => propName !== 'showOnNarrowScreens',
})<{ showOnNarrowScreens?: boolean }>(({ theme, showOnNarrowScreens }) => ({
    display: showOnNarrowScreens ? 'flex' : 'none',
    flexFlow: 'row nowrap',
    alignItems: 'center',

    ...onWideHeader(theme, {
        display: showOnNarrowScreens ? 'none' : 'flex',
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

const StyledTabs = styled(Tabs)({
    minWidth: 0,
    maxWidth: '100%',
    '& .MuiTabs-flexContainer': {
        // remove the global min height set in frontend/src/themes/theme.ts
        // (70px) and use the height of the tabs instead.
        minHeight: 'unset',
    },
});

const StyledTabButton = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    width: 'auto',
    fontSize: theme.typography.body2.fontSize,
    padding: '0 !important',
    ...onWideHeader(theme, {
        minWidth: 100,
    }),
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
    openStaleDialog: () => void;
    openDeleteDialog: () => void;
};

const HeaderActionsComponent = ({
    showOnNarrowScreens,
    feature,
    onFavorite,
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
    const { favorite, unfavorite } = useFavoriteFeaturesApi();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setToastData, setToastApiError } = useToast();

    const [openTagDialog, setOpenTagDialog] = useState(false);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [openStaleDialog, setOpenStaleDialog] = useState(false);

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

    const HeaderActionsInner: FC<{ showOnNarrowScreens?: boolean }> = ({
        showOnNarrowScreens,
    }) => {
        return (
            <HeaderActionsComponent
                showOnNarrowScreens={showOnNarrowScreens}
                feature={feature}
                onFavorite={onFavorite}
                openStaleDialog={() => setOpenStaleDialog(true)}
                openDeleteDialog={() => setShowDelDialog(true)}
            />
        );
    };

    return (
        <>
            <StyledHeader>
                <UpperHeaderRow>
                    <StyledTitle>
                        <Typography variant='h1'>{feature.name}</Typography>
                        <FeatureCopyName name={feature.name} />
                    </StyledTitle>
                    {feature.stale ? <FeatureStatusChip stale={true} /> : null}
                </UpperHeaderRow>
                <LowerHeaderRow>
                    <HeaderActionsInner showOnNarrowScreens />
                    <StyledTabs
                        value={activeTab.path}
                        indicatorColor='primary'
                        textColor='primary'
                        aria-label='Feature flag tabs'
                        variant='scrollable'
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
                    </StyledTabs>
                    <HeaderActionsInner />
                </LowerHeaderRow>
            </StyledHeader>
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
