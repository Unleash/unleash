'use strict';
const React = require('react');
const LogEntry = require('./LogEntry');

const LogEntryList = React.createClass({
    propTypes: {
        events: React.PropTypes.array.isRequired,
    },

    getInitialState () {
        return {
            showFullEvents: false,
        };
    },

    render () {
        const logEntryNodes = this.props.events.map(evt =>
            <LogEntry event={evt} key={evt.id} showFullEvents={this.state.showFullEvents} />);

        return (
            <div>
                <label className="prs fright-ht768 smalltext">
                    Show full events
                    <input
                        type="checkbox"
                        className="mlm"
                        value={this.state.fullEvents}
                        onChange={this.toggleFullEvents}>
                    </input>
                </label>

                <table className="outerborder zebra-striped">
                    <thead>
                        <tr>
                            <th>When</th>
                            <th>Action</th>
                            <th>
                                Data
                            </th>
                            <th>Author</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logEntryNodes}
                    </tbody>
                </table>
            </div>
        );
    },

    toggleFullEvents () {
        this.setState({ showFullEvents: !this.state.showFullEvents });
    },

});

module.exports = LogEntryList;
