'use strict';

const React = require('react');
const FeatureForm = require('./FeatureForm');
const LogEntryList = require('../log/LogEntryList');
const eventStore = require('../../stores/EventStore');

const Feature = React.createClass({
    getInitialState () {
        return {
            editMode: false,
            showHistory: false,
            events: [],
        };
    },

    handleEventsResponse (response) {
        this.setState({ events: response });
    },

    toggleHistory () {
        eventStore.getEventsByName(this.props.feature.name).then(this.handleEventsResponse);
        this.setState({ showHistory: !this.state.showHistory });
    },


    toggleEditMode () {
        this.setState({ editMode: !this.state.editMode });
    },

    saveFeature (feature) {
        this.props.onChange(feature);
        this.toggleEditMode();
    },

    archiveFeature () {
        if (window.confirm(`Are you sure you want to delete ${this.props.feature.name}?`)) {  // eslint-disable-line no-alert
            this.props.onArchive(this.props.feature);
        }
    },


    renderEditMode () {
        return (
            <tr>
                <td colSpan="4" className="pan man no-border">
                    <FeatureForm
                        feature={this.props.feature}
                        onSubmit={this.saveFeature}
                        onCancel={this.toggleEditMode}
                        strategies={this.props.strategies} />
                </td>
            </tr>
            );
    },

    render () {
        return (
            <tbody className="feature">
                <tr className={this.state.editMode ? 'edit bg-lilac-xlt' : ''}>
                    <td width="20">
                        <span className=
                        {this.props.feature.enabled ? 'toggle-active' : 'toggle-inactive'} title="Status" />
                    </td>
                    <td>
                        {this.props.feature.name} <br />
                        <span className="opaque smalltext word-break">
                            {this.props.feature.description || '\u00a0'}
                        </span>
                    </td>

                    <td  className="hide-lt480">
                        {this.props.feature.strategy}
                    </td>

                    <td width="150">
                        <div className="line">
                            <div className="unit size1of3">
                                <button
                                    title="Archive"
                                    onClick={this.archiveFeature}>
                                    <span className="icon-kryss1" />
                                </button>
                            </div>
                            <div className="unit size1of3">
                                <button
                                    className={this.state.editMode ? 'primary' : ''}
                                    title="Edit"
                                    onClick={this.toggleEditMode}>
                                    <span className="icon-redigere" />
                                </button>
                            </div>
                            <div className="unit size1of3">
                                <button
                                    className={this.state.showHistory ? 'primary' : ''}
                                    title="History"
                                    onClick={this.toggleHistory}>
                                    <span className="icon-visning_liste" />
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
                {this.state.editMode ? this.renderEditMode() : this.renderEmptyRow()}
                {this.state.showHistory ? this.renderHistory() : this.renderEmptyRow()}
            </tbody>
        );
    },

    renderEmptyRow () {
        return (<tr />);
    },

    renderHistory () {
        return (<tr>
                    <td colSpan="4" className="no-border">
                        <LogEntryList events={this.state.events} />
                    </td>
                </tr>);
    },

});

module.exports = Feature;
