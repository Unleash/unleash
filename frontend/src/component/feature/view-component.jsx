import React, { PropTypes } from 'react';
import { Tabs, Tab, ProgressBar, List, ListItem, ListItemContent } from 'react-mdl';
import { Link } from 'react-router';

import HistoryComponent from '../history/history-list-toggle-container';
import MetricComponent from './metric-component';
import EditFeatureToggle from './form-edit-container.jsx';
import { getIcon } from '../common';

export default class ViewFeatureToggleComponent extends React.Component {

    constructor (props) {
        super(props);

        this.state = { activeTab: 0 };
    }

    static propTypes () {
        return {
            featureToggleName: PropTypes.string.isRequired,
            features: PropTypes.array.isRequired,
            fetchFeatureToggles: PropTypes.array.isRequired,
        };
    }

    componentWillMount () {
        if (this.props.features.length === 0) {
            this.props.fetchFeatureToggles();
        }
        this.props.fetchSeenApps();
        this.props.fetchFeatureMetrics();
        this.timer = setInterval(() => {
            this.props.fetchFeatureMetrics();
        }, 5000);
    }

    componentWillUnmount () {
        clearInterval(this.timer);
    }

    render () {
        const {
            toggleFeature,
            features,
            featureToggleName,
            metrics = {},
        } = this.props;

        const featureToggle = features.find(toggle => toggle.name === featureToggleName);

        if (!featureToggle) {
            if (features.length === 0 ) {
                return <ProgressBar indeterminate />;
            }
            return <span>Could not find the toggle "{this.props.featureToggleName}"</span>;
        }

        let tabContent;
        if (this.state.activeTab === 0) {
            tabContent = <MetricComponent metrics={metrics} toggleFeature={toggleFeature} featureToggle={featureToggle} />;
        } else if (this.state.activeTab === 1) {
            tabContent = <EditFeatureToggle featureToggle={featureToggle} />;
        } else {
            tabContent = <HistoryComponent toggleName={featureToggleName} />;
        }

        return (
            <div>
                <h4>{featureToggle.name} <small>{featureToggle.enabled ? 'is enabled' : 'is disabled'}</small>
                    <small style={{ float: 'right', lineHeight: '38px' }}>
                        Created {(new Date(featureToggle.createdAt)).toLocaleString('nb-NO')}
                    </small>
                </h4>
                <div>{featureToggle.description}</div>
                <Tabs activeTab={this.state.activeTab}
                    onChange={(tabId) => this.setState({ activeTab: tabId })}
                    ripple
                    style={{ marginBottom: '10px' }}>
                    <Tab>Metrics</Tab>
                    <Tab>Edit</Tab>
                    <Tab>History</Tab>
                </Tabs>

                {tabContent}
            </div>
        );
    }
}