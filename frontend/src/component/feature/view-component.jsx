import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, ProgressBar, Button, Card, CardText, CardTitle, CardActions, Textfield, Switch } from 'react-mdl';
import { hashHistory, Link } from 'react-router';

import HistoryComponent from '../history/history-list-toggle-container';
import MetricComponent from './metric-container';
import EditFeatureToggle from './form/form-update-feature-container';
import ViewFeatureToggle from './form/form-view-feature-container';
import { styles as commonStyles } from '../common';

const TABS = {
    strategies: 0,
    view: 1,
    history: 2,
};

export default class ViewFeatureToggleComponent extends React.Component {
    isFeatureView;
    constructor(props) {
        super(props);
        this.isFeatureView = !!props.fetchFeatureToggles;
    }

    static propTypes = {
        activeTab: PropTypes.string.isRequired,
        featureToggleName: PropTypes.string.isRequired,
        features: PropTypes.array.isRequired,
        toggleFeature: PropTypes.func,
        removeFeatureToggle: PropTypes.func,
        revive: PropTypes.func,
        fetchArchive: PropTypes.func,
        fetchFeatureToggles: PropTypes.func,
        editFeatureToggle: PropTypes.func,
        featureToggle: PropTypes.object,
    };

    componentWillMount() {
        if (this.props.features.length === 0) {
            if (this.isFeatureView) {
                this.props.fetchFeatureToggles();
            } else {
                this.props.fetchArchive();
            }
        }
    }

    getTabContent(activeTab) {
        const { features, featureToggle, featureToggleName } = this.props;

        if (TABS[activeTab] === TABS.history) {
            return <HistoryComponent toggleName={featureToggleName} />;
        } else if (TABS[activeTab] === TABS.strategies) {
            if (this.isFeatureView) {
                return <EditFeatureToggle featureToggle={featureToggle} features={features} />;
            }
            return <ViewFeatureToggle featureToggle={featureToggle} />;
        } else {
            return <MetricComponent featureToggle={featureToggle} />;
        }
    }

    goToTab(tabName, featureToggleName) {
        let view = this.props.fetchFeatureToggles ? 'features' : 'archive';
        hashHistory.push(`/${view}/${tabName}/${featureToggleName}`);
    }

    render() {
        const {
            featureToggle,
            features,
            activeTab,
            revive,
            // setValue,
            featureToggleName,
            toggleFeature,
            removeFeatureToggle,
        } = this.props;

        if (!featureToggle) {
            if (features.length === 0) {
                return <ProgressBar indeterminate />;
            }
            return (
                <span>
                    Could not find the toggle{' '}
                    <Link
                        to={{
                            pathname: '/features/create',
                            query: { name: featureToggleName },
                        }}
                    >
                        {featureToggleName}
                    </Link>
                </span>
            );
        }

        const activeTabId = TABS[this.props.activeTab] ? TABS[this.props.activeTab] : TABS.strategies;
        const tabContent = this.getTabContent(activeTab);

        const removeToggle = () => {
            if (
                // eslint-disable-next-line no-alert
                window.confirm('Are you sure you want to remove this toggle?')
            ) {
                removeFeatureToggle(featureToggle.name);
                hashHistory.push('/features');
            }
        };
        const reviveToggle = () => {
            revive(featureToggle.name);
            hashHistory.push('/features');
        };
        const updateFeatureToggle = () => {
            let feature = { ...featureToggle };
            if (Array.isArray(feature.strategies)) {
                feature.strategies.forEach(s => {
                    delete s.id;
                });
            }

            this.props.editFeatureToggle(feature);
        };
        const setValue = (v, event) => {
            featureToggle[v] = event.target.value;
            this.forceUpdate();
        };

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <CardTitle style={{ paddingTop: '24px', wordBreak: 'break-all' }}>{featureToggle.name}</CardTitle>
                <CardText>
                    {this.isFeatureView ? (
                        <Textfield
                            floatingLabel
                            style={{ width: '100%' }}
                            rows={1}
                            label="Description"
                            required
                            value={featureToggle.description}
                            onChange={v => setValue('description', v)}
                            onBlur={updateFeatureToggle}
                        />
                    ) : (
                        <Textfield
                            disabled
                            floatingLabel
                            style={{ width: '100%' }}
                            rows={1}
                            label="Description"
                            required
                            value={featureToggle.description}
                        />
                    )}
                </CardText>

                <CardActions
                    border
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <span style={{ paddingRight: '24px' }}>
                        <Switch
                            disabled={!this.isFeatureView}
                            ripple
                            checked={featureToggle.enabled}
                            onChange={() => toggleFeature(featureToggle.name)}
                        >
                            {featureToggle.enabled ? 'Enabled' : 'Disabled'}
                        </Switch>
                    </span>

                    {this.isFeatureView ? (
                        <Button onClick={removeToggle} style={{ flexShrink: 0 }}>
                            Archive
                        </Button>
                    ) : (
                        <Button onClick={reviveToggle} style={{ flexShrink: 0 }}>
                            Revive
                        </Button>
                    )}
                </CardActions>
                <hr />
                <Tabs
                    activeTab={activeTabId}
                    ripple
                    tabBarProps={{ style: { width: '100%' } }}
                    className="mdl-color--grey-100"
                >
                    <Tab onClick={() => this.goToTab('strategies', featureToggleName)}>Strategies</Tab>
                    <Tab onClick={() => this.goToTab('view', featureToggleName)}>Metrics</Tab>
                    <Tab onClick={() => this.goToTab('history', featureToggleName)}>History</Tab>
                </Tabs>
                {tabContent}
            </Card>
        );
    }
}
