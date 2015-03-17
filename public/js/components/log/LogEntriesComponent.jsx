var React          = require('react');
var LogEntryList   = require('./LogEntryList');
var eventStore     = require('../../stores/EventStore');
var ErrorActions   = require('../../stores/ErrorActions');

var LogEntriesComponent = React.createClass({
    getInitialState: function() {
        return {
            createView: false,
            events: []
        };
    },

    componentDidMount: function () {
        eventStore.getEvents().then(function(res) {
            this.setState({events: res.events});
        }.bind(this), this.initError);
    },

    initError: function() {
        ErrorActions.error("Could not load events from server");
    },

    render: function() {
        return (
            <div>
                <hr />
                <LogEntryList events={this.state.events} />
            </div>
            );
    },
});

module.exports = LogEntriesComponent;
