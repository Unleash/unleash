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
import { useEffect, useState } from 'react';
import { useLastViewedFlags } from 'hooks/useLastViewedFlags';
import { FeatureOverviewEnvironments } from './FeatureOverviewEnvironments/FeatureOverviewEnvironments.tsx';
import { useEnvironmentVisibility } from './FeatureOverviewMetaData/EnvironmentVisibilityMenu/hooks/useEnvironmentVisibility.ts';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { StrategyDragTooltip } from './StrategyDragTooltip.tsx';
import { CleanupReminder } from '../CleanupReminder/CleanupReminder.tsx';
import { useFeature } from '../../../../hooks/api/getters/useFeature/useFeature.ts';

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
    gap: theme.spacing(2),
}));

export const FeatureOverview = () => {
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
    const { feature, refetchFeature, loading } = useFeature(
        projectId,
        featureId,
    );
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
                <div>
                    {!loading ? (
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
                <StyledMainContent>
                    <FeatureOverviewEnvironments
                        onToggleEnvOpen={toggleShowTooltip}
                        hiddenEnvironments={hiddenEnvironments}
                    />
                </StyledMainContent>
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
