import React, { PropTypes } from 'react';
import { Tabs, Tab, ProgressBar } from 'react-mdl';
import { hashHistory } from 'react-router';

import HistoryComponent from '../history/history-list-toggle-container';
import MetricComponent from './metric-container';
import EditFeatureToggle from './form-edit-container.jsx';

const TABS = {
    view: 0,
    edit: 1,
    history: 2,
};

export default class ViewFeatureToggleComponent extends React.Component {

    constructor (props) {
        super(props);
    }

    static propTypes () {
        return {
            activeTab: PropTypes.string.isRequired,
            featureToggleName: PropTypes.string.isRequired,
            features: PropTypes.array.isRequired,
            fetchFeatureToggles: PropTypes.array.isRequired,
            featureToggle: PropTypes.object.isRequired,
        };
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
        } = this.props;

        if (!featureToggle) {
            if (features.length === 0 ) {
                return <ProgressBar indeterminate />;
            }
            return <span>Could not find the toggle "{featureToggleName}"</span>;
        }

        const activeTabId = TABS[this.props.activeTab] ? TABS[this.props.activeTab] : TABS.view;
        const tabContent = this.getTabContent(activeTab);

        return (
            <div>
                <h4>{featureToggle.name} <small>{featureToggle.enabled ? 'is enabled' : 'is disabled'}</small>
                    <small style={{ float: 'right', lineHeight: '38px' }}>
                        Created {(new Date(featureToggle.createdAt)).toLocaleString('nb-NO')}
                    </small>
                </h4>
                <div>{featureToggle.description}</div>
                <Tabs activeTab={activeTabId} ripple style={{ marginBottom: '10px' }}>
                    <Tab onClick={() => this.goToTab('view', featureToggleName)}>Metrics</Tab>
                    <Tab onClick={() => this.goToTab('edit', featureToggleName)}>Edit</Tab>
                    <Tab onClick={() => this.goToTab('history', featureToggleName)}>History</Tab>
                </Tabs>

                {tabContent}
            </div>
        );
    }
}