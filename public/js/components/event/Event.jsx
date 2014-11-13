var React = require('react');

var Event = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    render: function() {
        return (
            <tr>
                <td>{this.props.event.data.name}</td>
                <td>{this.props.event.type}</td>
                <td>{this.props.event.createdBy}</td>
            </tr>
        );
    }
});

module.exports = Event;