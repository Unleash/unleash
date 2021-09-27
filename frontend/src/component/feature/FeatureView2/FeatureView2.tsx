import { Tabs, Tab } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import useFeature from '../../../hooks/api/getters/useFeature/useFeature';
import useTabs from '../../../hooks/useTabs';
import { IFeatureViewParams } from '../../../interfaces/params';
import TabPanel from '../../common/TabNav/TabPanel';
import FeatureStrategies from './FeatureStrategies/FeatureStrategies';
import { useStyles } from './FeatureView2.styles';
import FeatureViewEnvironment from './FeatureViewEnvironment/FeatureViewEnvironment';
import FeatureViewMetaData from './FeatureViewMetaData/FeatureViewMetaData';

const FeatureView2 = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);
    const { a11yProps, activeTab, setActiveTab } = useTabs(0);
    const styles = useStyles();

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
                    {feature?.environments.map(env => {
                        return (
                            <FeatureViewEnvironment env={env} key={env.name} />
                        );
                    })}
                </div>
            </div>
        );
    };

    const tabData = [
        { title: 'Overview', component: renderOverview() },
        { title: 'Strategies', component: <FeatureStrategies /> },
    ];

    const renderTabs = () => {
        return tabData.map((tab, index) => {
            return (
                <Tab
                    key={tab.title}
                    label={tab.title}
                    {...a11yProps(index)}
                    onClick={() => setActiveTab(index)}
                    className={styles.tabButton}
                />
            );
        });
    };

    const renderTabContent = () => {
        return tabData.map((tab, index) => {
            return (
                <TabPanel value={activeTab} index={index}>
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
                        value={activeTab}
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
