var React = require('react'),
    Event = require('./Event');

var EventList = React.createClass({
    propTypes: {
        events: React.PropTypes.array.isRequired
    },

    render: function() {
        var eventNodes = this.props.events.map(function(event) {
            return <Event event={event} key={event.name} />;
        });
        return (
            <div className='r-margin'>
                <table className='outerborder'>
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Action</th>
                            <th>Author</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventNodes}
                    </tbody>
                </table>
            </div>
            );
    }
});

module.exports = EventList;