import NewFeatureOverviewMetaData from './FeatureOverviewMetaData/FeatureOverviewMetaData';
import FeatureOverviewEnvironments from './FeatureOverviewEnvironments/FeatureOverviewEnvironments';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import {
    FeatureStrategyEdit,
    formatFeaturePath,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { FeatureOverviewSidePanel as NewFeatureOverviewSidePanel } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSidePanel/FeatureOverviewSidePanel';
import { useHiddenEnvironments } from 'hooks/useHiddenEnvironments';
import { styled } from '@mui/material';
import { FeatureStrategyCreate } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { useEffect, useState } from 'react';
import { useLastViewedFlags } from 'hooks/useLastViewedFlags';
import { useUiFlag } from 'hooks/useUiFlag';
import OldFeatureOverviewMetaData from './FeatureOverviewMetaData/OldFeatureOverviewMetaData';
import { OldFeatureOverviewSidePanel } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSidePanel/OldFeatureOverviewSidePanel';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { NewFeatureOverviewEnvironment } from './NewFeatureOverviewEnvironment/NewFeatureOverviewEnvironment';
import { ReleasePlanAddChangeRequestDialog } from './ReleasePlan/ReleasePlanAddChangeRequestDialog';

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
    const { setLastViewed } = useLastViewedFlags();
    useEffect(() => {
        setLastViewed({ featureId, projectId });
    }, [featureId]);
    const [environmentId, setEnvironmentId] = useState('');

    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign');
    const FeatureOverviewMetaData = flagOverviewRedesign
        ? NewFeatureOverviewMetaData
        : OldFeatureOverviewMetaData;
    const FeatureOverviewSidePanel = flagOverviewRedesign ? (
        <NewFeatureOverviewSidePanel
            environmentId={environmentId}
            setEnvironmentId={setEnvironmentId}
        />
    ) : (
        <OldFeatureOverviewSidePanel
            hiddenEnvironments={hiddenEnvironments}
            setHiddenEnvironments={setHiddenEnvironments}
        />
    );

    return (
        <StyledContainer>
            <div>
                <FeatureOverviewMetaData />
                {FeatureOverviewSidePanel}
            </div>
            <StyledMainContent>
                <ConditionallyRender
                    condition={flagOverviewRedesign}
                    show={
                        <NewFeatureOverviewEnvironment
                            environmentId={environmentId}
                        />
                    }
                    elseShow={<FeatureOverviewEnvironments />}
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
                <Route
                    path='release-plan/add'
                    element={<ReleasePlanAddChangeRequestDialog />}
                />
            </Routes>
        </StyledContainer>
    );
};

export default FeatureOverview;
