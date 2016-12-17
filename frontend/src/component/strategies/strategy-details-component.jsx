import React, { Component } from 'react';
import { Tabs, Tab, ProgressBar } from 'react-mdl';
import ShowStrategy from './show-strategy-component';
import EditStrategy from './edit-container';
import { HeaderTitle } from '../common';

const EDIT = 1;

export default class StrategyDetails extends Component {
    constructor (props) {
        super(props);
        this.state = { activeTab: 0 };
    }

    componentDidMount () {
        if (!this.props.strategy) {
            this.props.fetchStrategies();
        };
        if (!this.props.applications || this.props.applications.length === 0) {
            this.props.fetchApplications();
        }
        if (!this.props.toggles || this.props.toggles.length === 0) {
            this.props.fetchFeatureToggles();
        }
    }

    getTabContent (id) {
        if (id === EDIT) {
            return <EditStrategy strategy={this.props.strategy} />;
        } else {
            return (<ShowStrategy
                strategy={this.props.strategy}
                toggles={this.props.toggles}
                applications={this.props.applications} />);
        }
    }

    render () {
        const strategy = this.props.strategy;
        if (!strategy) {
            return <ProgressBar indeterminate />;
        }

        const tabContent = this.getTabContent(this.state.activeTab);

        return (
            <div>
                <HeaderTitle title={strategy.name} subtitle={strategy.description} />
                <Tabs activeTab={this.state.activeTab}
                    onChange={(tabId) => this.setState({ activeTab: tabId })} ripple>
                    <Tab>Details</Tab>
                    <Tab>Edit</Tab>
                </Tabs>
                <section>
                    <div className="content">
                        {tabContent}
                    </div>
                </section>
            </div>
        );
    }
}
