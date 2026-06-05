import FeatureOverviewMetaData from './FeatureOverviewMetaData/FeatureOverviewMetaData.tsx';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import {
    FeatureStrategyEdit,
    formatFeaturePath,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { styled } from '@mui/material';
import { FeatureStrategyCreate } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { type ReactNode, useEffect, useState } from 'react';
import { useLastViewedFlags } from 'hooks/useLastViewedFlags';
import { FeatureOverviewEnvironments } from './FeatureOverviewEnvironments/FeatureOverviewEnvironments.tsx';
import { useEnvironmentVisibility } from './FeatureOverviewMetaData/EnvironmentVisibilityMenu/hooks/useEnvironmentVisibility.ts';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { StrategyDragTooltip } from './StrategyDragTooltip.tsx';
import { CleanupReminder } from '../CleanupReminder/CleanupReminder.tsx';
import { useFeature } from '../../../../hooks/api/getters/useFeature/useFeature.ts';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useMinimumUnleashVersion } from 'hooks/useMinimumUnleashVersion.ts';
import type { FeatureSchema, ProjectOverviewSchema } from 'openapi/index.ts';
import { FeatureSetupBanner } from './FeatureSetupBanner.tsx';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
    },
}));

const StyledMainContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    // Flex items default to `min-width: auto`, which lets wide children (e.g. a
    // chart canvas) push the column past its container. `minWidth: 0` lets it
    // shrink to its parent's width and ellipsize/scroll internally instead.
    minWidth: 0,
    gap: theme.spacing(2),
}));

interface FeatureOverviewProps {
    header?: ReactNode;
}

export const FeatureOverview = ({ header }: FeatureOverviewProps) => {
    const flipMainContentOrder = useMinimumUnleashVersion('8.0.0');
    const navigate = useNavigate();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const featurePath = formatFeaturePath(projectId, featureId);
    const { hiddenEnvironments, onEnvironmentVisibilityChange } =
        useEnvironmentVisibility();
    const onSidebarClose = () => navigate(featurePath);
    usePageTitle(featureId);
    const { setLastViewed } = useLastViewedFlags();
    useEffect(() => {
        setLastViewed({ featureId, projectId });
    }, [featureId]);
    const { setSplashSeen } = useSplashApi();
    const { splash } = useAuthSplash();
    const [showTooltip, setShowTooltip] = useState(false);
    const [hasClosedTooltip, setHasClosedTooltip] = useState(false);
    const {
        feature,
        refetchFeature,
        loading: featureLoading,
    } = useFeature(projectId, featureId);
    const {
        project,
        loading: projectLoading,
        refetch: refetchProject,
    } = useProjectOverview(projectId);

    // A completed setup step can advance the project's or the feature's onboarding status,
    // so refresh both to re-evaluate the stage.
    const refreshSetupBanner = () => {
        refetchFeature();
        refetchProject();
    };
    const dragTooltipSplashId = 'strategy-drag-tooltip';
    const shouldShowStrategyDragTooltip = !splash?.[dragTooltipSplashId];
    const toggleShowTooltip = (envIsOpen: boolean) => {
        setShowTooltip(
            !hasClosedTooltip && shouldShowStrategyDragTooltip && envIsOpen,
        );
    };
    const onTooltipClose = () => {
        setHasClosedTooltip(true);
        setSplashSeen(dragTooltipSplashId);
    };

    return (
        <div>
            <CleanupReminder feature={feature} onChange={refetchFeature} />
            <StyledContainer>
                {!flipMainContentOrder && (
                    <div>
                        {!featureLoading ? (
                            <FeatureOverviewMetaData
                                hiddenEnvironments={hiddenEnvironments}
                                onEnvironmentVisibilityChange={
                                    onEnvironmentVisibilityChange
                                }
                                feature={feature}
                                onChange={refetchFeature}
                            />
                        ) : null}
                    </div>
                )}
                <StyledMainContent>
                    {!featureLoading && !projectLoading && (
                        <FeatureSetupBanner
                            project={{
                                ...(project as ProjectOverviewSchema),
                                id: projectId,
                            }}
                            feature={{
                                ...(feature as FeatureSchema),
                                id: featureId,
                            }}
                            onComplete={refreshSetupBanner}
                        />
                    )}
                    {!featureLoading && header}
                    <FeatureOverviewEnvironments
                        onToggleEnvOpen={toggleShowTooltip}
                        hiddenEnvironments={hiddenEnvironments}
                    />
                </StyledMainContent>
                {flipMainContentOrder && (
                    <div>
                        {!featureLoading ? (
                            <FeatureOverviewMetaData
                                hiddenEnvironments={hiddenEnvironments}
                                onEnvironmentVisibilityChange={
                                    onEnvironmentVisibilityChange
                                }
                                feature={feature}
                                onChange={refetchFeature}
                            />
                        ) : null}
                    </div>
                )}
                <Routes>
                    <Route
                        path='strategies/create'
                        element={
                            <SidebarModal
                                label='Create feature strategy'
                                onClose={onSidebarClose}
                                open
                            >
                                <FeatureStrategyCreate />
                            </SidebarModal>
                        }
                    />
                    <Route
                        path='strategies/edit'
                        element={
                            <SidebarModal
                                label='Edit feature strategy'
                                onClose={onSidebarClose}
                                open
                            >
                                <FeatureStrategyEdit />
                            </SidebarModal>
                        }
                    />
                </Routes>
            </StyledContainer>
            <StrategyDragTooltip show={showTooltip} onClose={onTooltipClose} />
        </div>
    );
};
