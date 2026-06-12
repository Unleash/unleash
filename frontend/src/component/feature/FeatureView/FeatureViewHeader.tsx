import { useState, type FC } from 'react';
import { styled, Tab, Tabs, type Theme, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { FeatureStatusChip } from 'component/common/FeatureStatusChip/FeatureStatusChip';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import useToast from 'hooks/useToast';
import { useUiFlag } from 'hooks/useUiFlag';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';
import { FeatureCopyName } from './FeatureCopyName/FeatureCopyName.tsx';
import { FeatureHeaderActionsKebab } from './FeatureHeaderActionsKebab';

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

const LowerHeaderRow = styled(UpperHeaderRow)({
    justifyContent: 'space-between',
    columnGap: 0,
    flexFlow: 'row nowrap',
});

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

const useLegacyVariants = (environments: IFeatureToggle['environments']) => {
    const enableLegacyVariants = useUiFlag('enableLegacyVariants');
    const existingLegacyVariantsExist = environments.some(
        (environment) => environment.variants?.length,
    );
    return enableLegacyVariants || existingLegacyVariantsExist;
};

type Props = {
    feature: IFeatureToggle;
};

export const FeatureViewHeader: FC<Props> = ({ feature }) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { favorite, unfavorite } = useFavoriteFeaturesApi();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setToastApiError } = useToast();

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
        } catch (_error) {
            setToastApiError('Something went wrong, could not update favorite');
        }
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
                    <FeatureHeaderActionsKebab
                        feature={feature}
                        onFavorite={onFavorite}
                        openStaleDialog={() => setOpenStaleDialog(true)}
                        openDeleteDialog={() => setShowDelDialog(true)}
                    />
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
        </>
    );
};
