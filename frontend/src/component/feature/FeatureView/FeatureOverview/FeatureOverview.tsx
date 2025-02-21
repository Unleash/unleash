import FeatureOverviewMetaData from './FeatureOverviewMetaData/FeatureOverviewMetaData';
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
import { useEffect } from 'react';
import { useLastViewedFlags } from 'hooks/useLastViewedFlags';
import { useUiFlag } from 'hooks/useUiFlag';
import { FeatureOverviewEnvironments } from './FeatureOverviewEnvironments/FeatureOverviewEnvironments';
import { default as LegacyFleatureOverview } from './LegacyFeatureOverview';
import { useEnvironmentVisibility } from './FeatureOverviewMetaData/EnvironmentVisibilityMenu/hooks/useEnvironmentVisibility';

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
    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign');

    if (!flagOverviewRedesign) {
        return <LegacyFleatureOverview />;
    }

    return (
        <StyledContainer>
            <div>
                <FeatureOverviewMetaData
                    hiddenEnvironments={hiddenEnvironments}
                    onEnvironmentVisibilityChange={
                        onEnvironmentVisibilityChange
                    }
                />
            </div>
            <StyledMainContent>
                <FeatureOverviewEnvironments
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
    );
};
