import FeatureOverviewMetaData from './FeatureOverviewMetaData/FeatureOverviewMetaData';
import FeatureOverviewEnvironments from './FeatureOverviewEnvironments/FeatureOverviewEnvironments';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { FeatureStrategyCreate } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import {
    FeatureStrategyEdit,
    formatFeaturePath,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { FeatureOverviewSidePanel } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSidePanel/FeatureOverviewSidePanel';
import { useHiddenEnvironments } from 'hooks/useHiddenEnvironments';
import { styled } from '@mui/material';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    [theme.breakpoints.down(1000)]: {
        flexDirection: 'column',
    },
}));

const StyledMainContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: `calc(100% - (350px + 1rem))`,
    [theme.breakpoints.down(1000)]: {
        width: '100%',
    },
}));

const FeatureOverview = () => {
    const navigate = useNavigate();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const featurePath = formatFeaturePath(projectId, featureId);
    const { hiddenEnvironments, setHiddenEnvironments } =
        useHiddenEnvironments();
    const onSidebarClose = () => navigate(featurePath);
    usePageTitle(featureId);

    return (
        <StyledContainer>
            <div>
                <FeatureOverviewMetaData />
                <FeatureOverviewSidePanel
                    hiddenEnvironments={hiddenEnvironments}
                    setHiddenEnvironments={setHiddenEnvironments}
                />
            </div>
            <StyledMainContent>
                <FeatureOverviewEnvironments />
            </StyledMainContent>
            <Routes>
                <Route
                    path="strategies/create"
                    element={
                        <SidebarModal
                            label="Create feature strategy"
                            onClose={onSidebarClose}
                            open
                        >
                            <FeatureStrategyCreate />
                        </SidebarModal>
                    }
                />
                <Route
                    path="strategies/edit"
                    element={
                        <SidebarModal
                            label="Edit feature strategy"
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

export default FeatureOverview;
