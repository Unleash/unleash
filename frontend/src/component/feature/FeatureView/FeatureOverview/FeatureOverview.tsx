import FeatureOverviewMetaData from './FeatureOverviewMetaData/FeatureOverviewMetaData';
import { useStyles } from './FeatureOverview.styles';
import FeatureOverviewEnvironments from './FeatureOverviewEnvironments/FeatureOverviewEnvironments';
import FeatureOverviewEnvSwitches from './FeatureOverviewEnvSwitches/FeatureOverviewEnvSwitches';
import { Switch, Route, useHistory } from 'react-router-dom';
import { FeatureStrategyCreate } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import {
    FeatureStrategyEdit,
    formatFeaturePath,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

const FeatureOverview = () => {
    const styles = useStyles();
    const { push } = useHistory();

    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const featurePath = formatFeaturePath(projectId, featureId);
    const onSidebarClose = () => push(featurePath);

    return (
        <div className={styles.container}>
            <div>
                <FeatureOverviewMetaData />
                <FeatureOverviewEnvSwitches />
            </div>
            <div className={styles.mainContent}>
                <FeatureOverviewEnvironments />
            </div>
            <Switch>
                <Route path="/projects/:projectId/features/:featureId/strategies/create">
                    <SidebarModal
                        label="Create feature strategy"
                        onClose={onSidebarClose}
                        open
                    >
                        <FeatureStrategyCreate />
                    </SidebarModal>
                </Route>
                <Route path="/projects/:projectId/features/:featureId/strategies/edit">
                    <SidebarModal
                        label="Edit feature strategy"
                        onClose={onSidebarClose}
                        open
                    >
                        <FeatureStrategyEdit />
                    </SidebarModal>
                </Route>
            </Switch>
        </div>
    );
};

export default FeatureOverview;
