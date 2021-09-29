import { useParams } from 'react-router-dom';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import { useStyles } from './FeatureStrategiesEnvironments.styles';
import { Tabs, Tab, Button } from '@material-ui/core';
import TabPanel from '../../../../common/TabNav/TabPanel';
import useTabs from '../../../../../hooks/useTabs';
import FeatureStrategiesEnvironmentList from './FeatureStrategiesEnvironmentList/FeatureStrategiesEnvironmentList';
import { useContext, useEffect, useState } from 'react';
import FeatureStrategiesUIContext from '../../../../../contexts/FeatureStrategiesUIContext';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import FeatureStrategiesConfigure from './FeatureStrategiesConfigure/FeatureStrategiesConfigure';
import classNames from 'classnames';
import useToast from '../../../../../hooks/useToast';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import cloneDeep from 'lodash.clonedeep';
import FeatureStrategiesRefresh from './FeatureStrategiesRefresh/FeatureStrategiesRefresh';
import FeatureEnvironmentStrategyExecution from './FeatureEnvironmentStrategyExecution/FeatureEnvironmentStrategyExecution';

const FeatureStrategiesEnvironments = () => {
    const startingTabId = 0;
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { toast, setToastData } = useToast();
    const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);

    const styles = useStyles();
    const { a11yProps, activeTab, setActiveTab } = useTabs(startingTabId);
    const {
        setActiveEnvironment,
        configureNewStrategy,
        expandedSidebar,
        setExpandedSidebar,
        featureCache,
        setFeatureCache,
    } = useContext(FeatureStrategiesUIContext);

    const { feature } = useFeature(projectId, featureId, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        refreshInterval: 5000,
    });

    useEffect(() => {
        if (!feature) return;
        if (featureCache === null || !featureCache.createdAt) {
            setFeatureCache(cloneDeep(feature));
        }
        /* eslint-disable-next-line */
    }, [feature]);

    useEffect(() => {
        if (!feature) return;
        if (featureCache === null) return;
        if (!featureCache.createdAt) return;

        const equal = compareCacheToFeature();

        if (!equal) {
            setShowRefreshPrompt(true);
        }
        /*eslint-disable-next-line */
    }, [feature]);

    useEffect(() => {
        setActiveEnvironment(feature?.environments[activeTab]);
        /* eslint-disable-next-line */
    }, [feature]);

    const renderTabs = () => {
        return featureCache?.environments?.map((env, index) => {
            return (
                <Tab
                    disabled={configureNewStrategy}
                    key={`${env.name}_${index}`}
                    label={env.name}
                    {...a11yProps(index)}
                    onClick={() => setActiveTab(index)}
                    className={styles.tabButton}
                />
            );
        });
    };

    const compareCacheToFeature = () => {
        let equal = true;
        // If the length of environments are different
        if (!featureCache) return false;
        if (
            feature?.environments?.length !== featureCache?.environments?.length
        ) {
            equal = false;
        }

        feature.environments.forEach(env => {
            const cachedEnv = featureCache.environments.find(
                cacheEnv => cacheEnv.name === env.name
            );

            if (!cachedEnv) {
                equal = false;
                return;
            }
            // If the type of environments are different
            if (env.type !== cachedEnv.type) {
                equal = false;
                return;
            }
        });

        if (!equal) return equal;

        feature.environments.forEach(env => {
            const cachedEnv = featureCache.environments.find(
                cachedEnv => cachedEnv.name === env.name
            );

            if (!cachedEnv) return;

            if (cachedEnv.strategies.length !== env.strategies.length) {
                equal = false;
                return;
            }

            env.strategies.forEach(strategy => {
                const cachedStrategy = cachedEnv.strategies.find(
                    cachedStrategy => cachedStrategy.id === strategy.id
                );
                // Check stickiness
                if (cachedStrategy?.stickiness !== strategy?.stickiness) {
                    equal = false;
                    return;
                }

                if (cachedStrategy?.groupId !== strategy?.groupId) {
                    equal = false;
                    return;
                }

                // Check groupId

                const cacheParamKeys = Object.keys(cachedStrategy?.parameters);
                const strategyParamKeys = Object.keys(strategy?.parameters);
                // Check length of parameters
                if (cacheParamKeys.length !== strategyParamKeys.length) {
                    equal = false;
                    return;
                }

                // Make sure parameters are the same
                strategyParamKeys.forEach(key => {
                    const found = cacheParamKeys.find(
                        cacheKey => cacheKey === key
                    );

                    if (!found) {
                        equal = false;
                        return;
                    }
                });

                // Check value of parameters
                strategyParamKeys.forEach(key => {
                    const strategyValue = strategy.parameters[key];
                    const cachedValue = cachedStrategy.parameters[key];

                    if (strategyValue !== cachedValue) {
                        equal = false;
                        return;
                    }
                });

                // Check length of constraints
                const cachedConstraints = cachedStrategy.constraints;
                const strategyConstraints = strategy.constraints;

                if (cachedConstraints.length !== strategyConstraints.length) {
                    equal = false;
                    return;
                }

                // Check constraints -> are we g    uaranteed that constraints will occur in the same order each time?
            });
        });

        return equal;

        // If the parameter values are different
        // If the constraint length is different
        // If the constraint operators are different
        // If the constraint values are different
        // If the stickiness is different
        // If the groupId is different
    };

    const renderTabPanels = () => {
        const tabContentClasses = classNames(styles.tabContentContainer, {
            [styles.containerListView]: configureNewStrategy,
        });

        const listContainerClasses = classNames(styles.listContainer, {
            [styles.listContainerFullWidth]: expandedSidebar,
        });

        return featureCache?.environments?.map((env, index) => {
            return (
                <TabPanel
                    key={`tab_panel_${index}`}
                    value={activeTab}
                    index={index}
                >
                    <div className={tabContentClasses}>
                        <div className={listContainerClasses}>
                            <FeatureStrategiesEnvironmentList
                                strategies={env.strategies}
                            />
                        </div>
                        <ConditionallyRender
                            condition={
                                !expandedSidebar && !configureNewStrategy
                            }
                            show={
                                <FeatureEnvironmentStrategyExecution
                                    strategies={env.strategies}
                                    env={env}
                                />
                            }
                        />
                    </div>
                </TabPanel>
            );
        });
    };

    const handleRefresh = () => {
        setFeatureCache(cloneDeep(feature));
        setShowRefreshPrompt(false);
    };

    const handleCancel = () => {
        setShowRefreshPrompt(false);
    };

    const classes = classNames(styles.container, {
        [styles.fullWidth]: !expandedSidebar,
    });

    return (
        <div className={classes}>
            <div className={styles.environmentsHeader}>
                <h2 className={styles.header}>Environments</h2>

                <FeatureStrategiesRefresh
                    show={showRefreshPrompt}
                    refresh={handleRefresh}
                    cancel={handleCancel}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setExpandedSidebar(prev => !prev)}
                >
                    {expandedSidebar ? 'Hide sidebar' : 'Add new strategy'}
                </Button>
            </div>
            <div className={styles.tabContainer}>
                <Tabs
                    value={activeTab}
                    onChange={(_, tabId) => {
                        setActiveTab(tabId);
                        setActiveEnvironment(featureCache?.environments[tabId]);
                    }}
                    indicatorColor="primary"
                    textColor="primary"
                    className={styles.tabNavigation}
                >
                    {renderTabs()}
                </Tabs>
            </div>

            <div>
                {renderTabPanels()}
                <ConditionallyRender
                    condition={configureNewStrategy}
                    show={
                        <FeatureStrategiesConfigure
                            setToastData={setToastData}
                        />
                    }
                />
            </div>
            {toast}
        </div>
    );
};

export default FeatureStrategiesEnvironments;
