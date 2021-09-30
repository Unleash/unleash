import { Tabs, Tab } from '@material-ui/core';
import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import useFeature from '../../../hooks/api/getters/useFeature/useFeature';
import useTabs from '../../../hooks/useTabs';
import { IFeatureViewParams } from '../../../interfaces/params';
import TabPanel from '../../common/TabNav/TabPanel';
import FeatureStrategies from './FeatureStrategies/FeatureStrategies';
import { useStyles } from './FeatureView2.styles';
import FeatureViewEnvironment from './FeatureViewEnvironment/FeatureViewEnvironment';
import FeatureViewMetaData from './FeatureViewMetaData/FeatureViewMetaData';

const FeatureView2 = () => {
    const { projectId, featureId, activeTab } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);
    const { a11yProps, activeTabIdx, setActiveTab } = useTabs(0);
    const styles = useStyles();
    const history = useHistory();

    const basePath = `/projects/${projectId}/features2/${featureId}`;

    useEffect(() => {
        const tabIdx = tabData.findIndex(tab => tab.name === activeTab);
        setActiveTab(tabIdx);
        /* eslint-disable-next-line */
    }, []);

    const renderOverview = () => {
        return (
            <div style={{ display: 'flex', width: '100%' }}>
                <FeatureViewMetaData />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                    }}
                >
                    {feature?.environments?.map(env => {
                        return (
                            <FeatureViewEnvironment env={env} key={env.name} />
                        );
                    })}
                </div>
            </div>
        );
    };

    const tabData = [
        {
            title: 'Overview',
            component: renderOverview(),
            path: `${basePath}/overview`,
            name: 'overview',
        },
        {
            title: 'Strategies',
            component: <FeatureStrategies />,
            path: `${basePath}/strategies`,
            name: 'strategies',
        },
    ];

    const renderTabs = () => {
        return tabData.map((tab, index) => {
            return (
                <Tab
                    key={tab.title}
                    label={tab.title}
                    {...a11yProps(index)}
                    onClick={() => {
                        setActiveTab(index);
                        history.push(tab.path);
                    }}
                    className={styles.tabButton}
                />
            );
        });
    };

    const renderTabContent = () => {
        return tabData.map((tab, index) => {
            return (
                <TabPanel value={activeTabIdx} index={index} key={tab.path}>
                    {tab.component}
                </TabPanel>
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
                        value={activeTabIdx}
                        onChange={(_, tabId) => {
                            setActiveTab(tabId);
                        }}
                        indicatorColor="primary"
                        textColor="primary"
                        className={styles.tabNavigation}
                    >
                        {renderTabs()}
                    </Tabs>
                </div>
            </div>
            {renderTabContent()}
        </>
    );
};

export default FeatureView2;
