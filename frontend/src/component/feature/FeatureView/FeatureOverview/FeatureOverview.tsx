import FeatureOverviewMetaData from './FeatureOverviewMetaData/FeatureOverviewMetaData';
import { useStyles } from './FeatureOverview.styles';
import FeatureOverviewEnvironments from './FeatureOverviewEnvironments/FeatureOverviewEnvironments';
import FeatureOverviewEnvSwitches from './FeatureOverviewEnvSwitches/FeatureOverviewEnvSwitches';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { FeatureStrategyCreate } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import {
    FeatureStrategyEdit,
    formatFeaturePath,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { FeatureOverviewSidePanel } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSidePanel/FeatureOverviewSidePanel';
import { useHiddenEnvironments } from 'hooks/useHiddenEnvironments';

const FeatureOverview = () => {
    const { uiConfig } = useUiConfig();
    const { classes: styles } = useStyles();
    const navigate = useNavigate();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const featurePath = formatFeaturePath(projectId, featureId);
    const { hiddenEnvironments, setHiddenEnvironments } =
        useHiddenEnvironments();
    const onSidebarClose = () => navigate(featurePath);
    usePageTitle(featureId);

    return (
        <div className={styles.container}>
            <div>
                <FeatureOverviewMetaData />
                <ConditionallyRender
                    condition={Boolean(uiConfig.flags.variantsPerEnvironment)}
                    show={
                        <FeatureOverviewSidePanel
                            hiddenEnvironments={hiddenEnvironments}
                            setHiddenEnvironments={setHiddenEnvironments}
                        />
                    }
                    elseShow={
                        <FeatureOverviewEnvSwitches
                            hiddenEnvironments={hiddenEnvironments}
                            setHiddenEnvironments={setHiddenEnvironments}
                        />
                    }
                />
            </div>
            <div className={styles.mainContent}>
                <FeatureOverviewEnvironments />
            </div>
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
        </div>
    );
};

export default FeatureOverview;
