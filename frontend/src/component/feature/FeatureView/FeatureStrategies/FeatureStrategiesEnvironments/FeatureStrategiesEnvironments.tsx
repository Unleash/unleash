import { useHistory, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Tabs, Tab, useMediaQuery } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import classNames from 'classnames';
import cloneDeep from 'lodash.clonedeep';

import { IFeatureViewParams } from '../../../../../interfaces/params';
import { ADD_NEW_STRATEGY_ID } from '../../../../../testIds';
import { CREATE_FEATURE_STRATEGY } from '../../../../providers/AccessProvider/permissions';

import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import useTabs from '../../../../../hooks/useTabs';
import useQueryParams from '../../../../../hooks/useQueryParams';

import TabPanel from '../../../../common/TabNav/TabPanel';
import FeatureStrategiesEnvironmentList from './FeatureStrategiesEnvironmentList/FeatureStrategiesEnvironmentList';
import FeatureStrategiesUIContext from '../../../../../contexts/FeatureStrategiesUIContext';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import FeatureStrategiesConfigure from './FeatureStrategiesConfigure/FeatureStrategiesConfigure';
import FeatureStrategiesRefresh from './FeatureStrategiesRefresh/FeatureStrategiesRefresh';
import ResponsiveButton from '../../../../common/ResponsiveButton/ResponsiveButton';
import AccessContext from '../../../../../contexts/AccessContext';

import { useStyles } from './FeatureStrategiesEnvironments.styles';
import EnvironmentIcon from '../../../../common/EnvironmentIcon/EnvironmentIcon';
import NoItemsStrategies from '../../../../common/NoItems/NoItemsStrategies/NoItemsStrategies';

const FeatureStrategiesEnvironments = () => {
    const smallScreen = useMediaQuery('(max-width:700px)');
    const { hasAccess } = useContext(AccessContext);
    const history = useHistory();

    const startingTabId = 0;
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);

    const styles = useStyles();
    const query = useQueryParams();
    const addStrategy = query.get('addStrategy');
    const environmentTab = query.get('environment');

    const { a11yProps, activeTabIdx, setActiveTab } = useTabs(startingTabId);
    const {
        // @ts-expect-error
        setActiveEnvironment,
        // @ts-expect-error
        activeEnvironment,
        // @ts-expect-error
        configureNewStrategy,
        // @ts-expect-error
        expandedSidebar,
        // @ts-expect-error
        setExpandedSidebar,
        // @ts-expect-error
        featureCache,
        // @ts-expect-error
        setFeatureCache,
    } = useContext(FeatureStrategiesUIContext);

    const { feature } = useFeature(projectId, featureId, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        refreshInterval: 5000,
    });

    useEffect(() => {
        if (addStrategy) {
            setExpandedSidebar(true);
        }
        if (!feature) return;

        if (environmentTab) {
            const env = feature.environments.find(
                env => env.name === environmentTab
            );
            const index = feature.environments.findIndex(
                env => env.name === environmentTab
            );
            if (index < 0 || !env) return;
            setActiveEnvironment(env);
            setActiveTab(index);
            return;
        }

        if (feature?.environments?.length === 0) return;
        setActiveEnvironment(feature?.environments[activeTabIdx]);
        /*eslint-disable-next-line */
    }, [feature]);

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
    if (!feature) return null;

    const renderTabs = () => {
        // @ts-expect-error
        return featureCache?.environments?.map((env, index) => {
            return (
                <Tab
                    disabled={!!configureNewStrategy}
                    key={`${env.name}_${index}`}
                    label={env.name}
                    icon={<EnvironmentIcon enabled={env.enabled} />}
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

        feature?.environments?.forEach(env => {
            const cachedEnv = featureCache?.environments?.find(
                // @ts-expect-error
                cacheEnv => cacheEnv.name === env.name
            );

            if (!cachedEnv) {
                equal = false;
                return;
            }
            // If displayName is different
            // @ts-expect-error
            if (env?.displayName !== cachedEnv?.displayName) {
                equal = false;
                return;
            }
            // If the type of environments are different
            if (env?.type !== cachedEnv?.type) {
                equal = false;
                return;
            }
        });

        if (!equal) return equal;

        feature?.environments?.forEach(env => {
            const cachedEnv = featureCache?.environments?.find(
                // @ts-expect-error
                cachedEnv => cachedEnv.name === env.name
            );

            if (!cachedEnv) return;

            if (cachedEnv.strategies.length !== env.strategies.length) {
                equal = false;
                return;
            }

            env?.strategies?.forEach(strategy => {
                const cachedStrategy = cachedEnv?.strategies?.find(
                    // @ts-expect-error
                    cachedStrategy => cachedStrategy.id === strategy.id
                );
                // Check stickiness
                // @ts-expect-error
                if (cachedStrategy?.stickiness !== strategy?.stickiness) {
                    equal = false;
                    return;
                }

                // @ts-expect-error
                if (cachedStrategy?.groupId !== strategy?.groupId) {
                    equal = false;
                    return;
                }

                // Check groupId

                const cacheParamKeys = Object.keys(
                    cachedStrategy?.parameters || {}
                );
                const strategyParamKeys = Object.keys(
                    strategy?.parameters || {}
                );
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
    };

    const renderTabPanels = () => {
        const tabContentClasses = classNames(styles.tabContentContainer, {
            [styles.containerListView]: configureNewStrategy,
        });

        const outerTabContentClasses = classNames(
            styles.outerTabContentContainer,
            {
                [styles.selectStrategy]:
                    expandedSidebar || configureNewStrategy,
                [styles.configureStrategy]: configureNewStrategy,
            }
        );

        const listContainerClasses = classNames(styles.listContainer, {
            [styles.listContainerFullWidth]: expandedSidebar,
            [styles.listContainerWithoutSidebar]: !hasAccess(
                CREATE_FEATURE_STRATEGY,
                projectId,
                activeEnvironment?.name
            ),
        });

        // @ts-expect-error
        return featureCache?.environments?.map((env, index) => {
            return (
                <TabPanel
                    key={`tab_panel_${index}`}
                    value={activeTabIdx}
                    index={index}
                >
                    <div className={outerTabContentClasses}>
                        <div className={styles.strategyButtonContainer}>
                            <ConditionallyRender
                                condition={
                                    !expandedSidebar && !configureNewStrategy
                                }
                                show={
                                    <ResponsiveButton
                                        className={styles.addStrategyButton}
                                        data-test={ADD_NEW_STRATEGY_ID}
                                        onClick={() =>
                                            // @ts-expect-error
                                            setExpandedSidebar(prev => !prev)
                                        }
                                        Icon={Add}
                                        maxWidth="700px"
                                        projectId={projectId}
                                        environmentId={activeEnvironment.name}
                                        permission={CREATE_FEATURE_STRATEGY}
                                    >
                                        New strategy
                                    </ResponsiveButton>
                                }
                            />
                        </div>
                        <div className={tabContentClasses}>
                            <ConditionallyRender
                                condition={
                                    env.strategies.length > 0 || expandedSidebar
                                }
                                show={
                                    <div className={listContainerClasses}>
                                        <FeatureStrategiesEnvironmentList
                                            strategies={env.strategies}
                                        />
                                    </div>
                                }
                                elseShow={
                                    <ConditionallyRender
                                        condition={!expandedSidebar}
                                        show={
                                            <NoItemsStrategies
                                                envName={env.name}
                                                onClick={() =>
                                                    setExpandedSidebar(
                                                        // @ts-expect-error
                                                        prev => !prev
                                                    )
                                                }
                                                projectId={projectId}
                                            />
                                        }
                                    />
                                }
                            />
                        </div>
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
            <ConditionallyRender
                condition={(!expandedSidebar && smallScreen) || !smallScreen}
                show={
                    <>
                        <div className={styles.environmentsHeader}>
                            <FeatureStrategiesRefresh
                                show={showRefreshPrompt}
                                refresh={handleRefresh}
                                cancel={handleCancel}
                            />
                        </div>
                        <ConditionallyRender
                            condition={
                                !expandedSidebar && !configureNewStrategy
                            }
                            show={
                                <div className={styles.tabContainer}>
                                    <Tabs
                                        value={activeTabIdx}
                                        onChange={(_, tabId) => {
                                            setActiveTab(tabId);
                                            setActiveEnvironment(
                                                feature?.environments[tabId]
                                            );
                                            history.replace(
                                                history.location.pathname
                                            );
                                        }}
                                        indicatorColor="primary"
                                        textColor="primary"
                                        className={styles.tabNavigation}
                                    >
                                        {renderTabs()}
                                    </Tabs>
                                </div>
                            }
                        />

                        <div>
                            {renderTabPanels()}
                            <ConditionallyRender
                                condition={configureNewStrategy}
                                show={<FeatureStrategiesConfigure />}
                            />
                        </div>
                    </>
                }
            />
        </div>
    );
};

export default FeatureStrategiesEnvironments;
