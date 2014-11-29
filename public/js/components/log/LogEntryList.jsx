var React = require('react'),
    LogEntry = require('./LogEntry');

var LogEntryList = React.createClass({
    propTypes: {
        events: React.PropTypes.array.isRequired
    },

    render: function() {
        var logEntryNodes = this.props.events.map(function(event) {
            return <LogEntry event={event} key={event.name} />;
        });
        return (
            <div className=''>
                <table className='outerborder zebra-striped'>
                    <thead>
                        <tr>
                            <th>When</th>
                            <th>Action</th>
                            <th>Data</th>
                            <th>Author</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logEntryNodes}
                    </tbody>
                </table>
            </div>
            );
    }
});

module.exports = LogEntryList;