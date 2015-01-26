var React = require('react'),
    LogEntry = require('./LogEntry');

var LogEntryList = React.createClass({
    propTypes: {
        events: React.PropTypes.array.isRequired
    },

    getInitialState: function() {
        return {
            showFullEvents: false
        }
    },

    render: function() {
        var logEntryNodes = this.props.events.map(function(event) {
            return <LogEntry event={event} key={event.id} showFullEvents={this.state.showFullEvents} />;
        }.bind(this));

        return (
            <div>
               <label className="prs fright-ht768 smalltext">
                 Show full events
                 <input type="checkbox" className="mlm" value={this.state.fullEvents} onChange={this.toggleFullEvents}></input>
                </label>

                <table className='outerborder zebra-striped'>
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

    toggleFullEvents: function(e) {
        this.setState({showFullEvents: !this.state.showFullEvents});
    }

});

module.exports = LogEntryList;