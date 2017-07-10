import React, { PropTypes } from 'react';
import { Tabs, Tab, ProgressBar, Button, Card, CardTitle, CardText, CardActions, Switch } from 'react-mdl';
import { hashHistory, Link } from 'react-router';

import HistoryComponent from '../history/history-list-toggle-container';
import MetricComponent from './metric-container';
import EditFeatureToggle from './form-edit-container.jsx';
import { styles as commonStyles } from '../common';

const TABS = {
    view: 0,
    edit: 1,
    history: 2,
};

export default class ViewFeatureToggleComponent extends React.Component {
    constructor (props) {
        super(props);
    }

    static propTypes = {
        activeTab: PropTypes.string.isRequired,
        featureToggleName: PropTypes.string.isRequired,
        features: PropTypes.array.isRequired,
        toggleFeature: PropTypes.func.isRequired,
        removeFeatureToggle: PropTypes.func.isRequired,
        fetchFeatureToggles: PropTypes.array.isRequired,
        featureToggle: PropTypes.object.isRequired,
    }

    componentWillMount () {
        if (this.props.features.length === 0) {
            this.props.fetchFeatureToggles();
        }
    }

    getTabContent (activeTab) {
        const {
            featureToggle,
            featureToggleName,
        } = this.props;

        if (TABS[activeTab] === TABS.history) {
            return <HistoryComponent toggleName={featureToggleName} />;
        } else if (TABS[activeTab] === TABS.edit) {
            return <EditFeatureToggle featureToggle={featureToggle} />;
        } else {
            return <MetricComponent featureToggle={featureToggle} />;
        }
    }

    goToTab (tabName, featureToggleName) {
        hashHistory.push(`/features/${tabName}/${featureToggleName}`);
    }

    render () {
        const {
            featureToggle,
            features,
            activeTab,
            featureToggleName,
            toggleFeature,
            removeFeatureToggle,
        } = this.props;

        if (!featureToggle) {
            if (features.length === 0 ) {
                return <ProgressBar indeterminate />;
            }
            return (
                <span>
                    Could not find the toggle <Link to={{ pathname: '/features/create', query: { name: featureToggleName } }}>
                        {featureToggleName}</Link>
                </span>
            );
        }

        const activeTabId = TABS[this.props.activeTab] ? TABS[this.props.activeTab] : TABS.view;
        const tabContent = this.getTabContent(activeTab);

        const removeToggle = () => {
            if (window.confirm('Are you sure you want to remove this toggle?')) { // eslint-disable-line no-alert
                removeFeatureToggle(featureToggle.name);
                hashHistory.push('/features');
            }
        };

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <CardTitle style={{ paddingTop: '24px', wordBreak: 'break-all' }}>{featureToggle.name}</CardTitle>
                <CardText>{featureToggle.description}</CardText>
                <CardActions border style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ paddingRight: '24px' }}>
                        <Switch ripple checked={featureToggle.enabled} onChange={() => toggleFeature(featureToggle.name)}>
                            {featureToggle.enabled ? 'Enabled' : 'Disabled'}
                        </Switch>
                    </span>
                    <Button onClick={removeToggle} style={{ flexShrink: 0 }}>Archive</Button>
                </CardActions>
                <hr/>
                <Tabs activeTab={activeTabId} ripple tabBarProps={{ style: { width: '100%' } }} className="mdl-color--grey-100">
                    <Tab onClick={() => this.goToTab('view', featureToggleName)}>Metrics</Tab>
                    <Tab onClick={() => this.goToTab('edit', featureToggleName)}>Edit</Tab>
                    <Tab onClick={() => this.goToTab('history', featureToggleName)}>History</Tab>
                </Tabs>
                {tabContent}
            </Card>
        );
    }
}
