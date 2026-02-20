import { type FC, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { useLastViewedFlags } from 'hooks/useLastViewedFlags';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useEnvironmentVisibility } from '../FeatureOverview/FeatureOverviewMetaData/EnvironmentVisibilityMenu/hooks/useEnvironmentVisibility';
import FeatureOverviewMetaData from '../FeatureOverview/FeatureOverviewMetaData/FeatureOverviewMetaData';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import {
    FeatureStrategyEdit,
    formatFeaturePath,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { FeatureStrategyCreate } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { FeatureImpactHeader } from './FeatureImpactHeader';
import { FeatureOverviewEnvironments } from '../FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironments';
import { CleanupReminder } from '../CleanupReminder/CleanupReminder';

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

export type TimeRange = 'hour' | 'day' | 'week' | 'month';

export const FeatureImpactOverview: FC = () => {
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
    }, [featureId, projectId, setLastViewed]);

    const { feature, refetchFeature, loading } = useFeature(
        projectId,
        featureId,
    );

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
                    <FeatureImpactHeader
                        projectId={projectId}
                        featureName={featureId}
                    />
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
        </div>
    );
};
