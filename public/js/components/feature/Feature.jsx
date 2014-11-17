var React = require('react');
var FeatureForm = require('./FeatureForm');
var LogEntryList = require('../log/LogEntryList');
var eventStore = require('../../stores/EventStore');



var Feature = React.createClass({
    getInitialState: function() {
        return {
            editMode: false,
            showHistory: false,
            events: []
        };
    },

    handleEventsResponse: function(response) {
      this.setState({events: response});
    },

    toggleHistory: function() {
        eventStore.getEventsByName(this.props.feature.name).then(this.handleEventsResponse);
        this.setState({showHistory: !this.state.showHistory});
    },


    toggleEditMode: function() {
        this.setState({editMode: !this.state.editMode});
    },

    saveFeature: function(feature) {
        this.props.onChange(feature);
        this.toggleEditMode();
    },

    render: function() {
        return this.state.editMode ? this.renderEditMode() : this.renderViewMode();
    },

    renderEditMode: function() {
        return (
            <tr>
                <td colSpan="5">
                    <FeatureForm feature={this.props.feature} onSubmit={this.saveFeature} onCancel={this.toggleEditMode} />
                </td>
            </tr>
            );

    },

    renderViewMode: function() {
        return (
            <tbody>
                <tr>
                    <td width="20">
                        <span className={this.props.feature.enabled ? "toggle-active" : "toggle-inactive"} title="Status">
                        </span>
                    </td>
                    <td>
                        {this.props.feature.name}
                    </td>

                    <td className='opaque smalltext word-break' width="600">
                        {this.props.feature.description || '\u00a0'}
                    </td>

                    <td>
                        {this.props.feature.strategy}
                    </td>

                    <td className="rightify">
                        <input type='button' value='Edit' onClick={this.toggleEditMode}/>
                        <input type='button' value='History' onClick={this.toggleHistory} />
                    </td>
                </tr>
                {this.state.showHistory ? this.renderHistory() : this.renderEmptyRow()}
            </tbody>
        );
    },

    renderEmptyRow: function() {
        return (<tr />);
    },

    renderHistory: function() {
        return (<tr>
                    <td colSpan="5"><LogEntryList events={this.state.events} /></td>
                </tr>);
    }

});

module.exports = Feature;