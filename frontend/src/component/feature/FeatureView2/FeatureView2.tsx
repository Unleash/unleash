import { Tabs, Tab } from '@material-ui/core';
import { Route, useHistory, useParams } from 'react-router-dom';
import useFeature from '../../../hooks/api/getters/useFeature/useFeature';
import useTabs from '../../../hooks/useTabs';
import { IFeatureViewParams } from '../../../interfaces/params';
import FeatureLog from './FeatureLog/FeatureLog';
import FeatureMetrics from './FeatureMetrics/FeatureMetrics';
import FeatureOverview from './FeatureOverview/FeatureOverview';
import FeatureStrategies from './FeatureStrategies/FeatureStrategies';
import FeatureVariants from './FeatureVariants/FeatureVariants';
import { useStyles } from './FeatureView2.styles';

const FeatureView2 = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);
    const { a11yProps } = useTabs(0);
    const styles = useStyles();
    const history = useHistory();

    const basePath = `/projects/${projectId}/features2/${featureId}`;

    const tabData = [
        {
            title: 'Overview',
            path: `${basePath}/overview`,
            name: 'overview',
        },
        {
            title: 'Strategies',
            path: `${basePath}/strategies`,
            name: 'strategies',
        },
        {
            title: 'Metrics',
            path: `${basePath}/metrics`,
            name: 'Metrics',
        },
        {
            title: 'Event log',
            path: `${basePath}/logs`,
            name: 'Event log',
        },
        { title: 'Variants', path: `${basePath}/variants`, name: 'Variants' },
    ];

    const renderTabs = () => {
        return tabData.map((tab, index) => {
            return (
                <Tab
                    key={tab.title}
                    label={tab.title}
                    value={tab.path}
                    {...a11yProps(index)}
                    onClick={() => {
                        history.push(tab.path);
                    }}
                    className={styles.tabButton}
                />
            );
        });
    };

    return (
        <>
            <div className={styles.header}>
                <div className={styles.innerContainer}>
                    <h2 className={styles.featureViewHeader}>{feature.name}</h2>
                </div>
                <div className={styles.separator} />
                <div className={styles.tabContainer}>
                    <Tabs
                        value={history.location.pathname}
                        indicatorColor="primary"
                        textColor="primary"
                        className={styles.tabNavigation}
                    >
                        {renderTabs()}
                    </Tabs>
                </div>
            </div>
            <Route
                path={`/projects/:projectId/features2/:featureId/overview`}
                component={FeatureOverview}
            />
            <Route
                path={`/projects/:projectId/features2/:featureId/strategies`}
                component={FeatureStrategies}
            />
            <Route
                path={`/projects/:projectId/features2/:featureId/metrics`}
                component={FeatureMetrics}
            />
            <Route
                path={`/projects/:projectId/features2/:featureId/logs`}
                component={FeatureLog}
            />
            <Route
                path={`/projects/:projectId/features2/:featureId/variants`}
                component={FeatureVariants}
            />
        </>
    );
};

export default FeatureView2;
