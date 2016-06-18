'use strict';
const React          = require('react');
const LogEntryList   = require('./LogEntryList');
const eventStore     = require('../../stores/EventStore');
const ErrorActions   = require('../../stores/ErrorActions');

const LogEntriesComponent = React.createClass({
    getInitialState() {
        return {
            createView: false,
            events: [],
        };
    },

    componentDidMount() {
        eventStore.getEvents().then(res => {
            this.setState({ events: res.events });
        }, this.initError);
    },

    initError() {
        ErrorActions.error('Could not load events from server');
    },

    render() {
        return (
            <div>
                <h1>Log</h1>
                <hr />
                <LogEntryList events={this.state.events} />
            </div>
            );
    },
});

module.exports = LogEntriesComponent;
