var React = require('react');

var LogEntry = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    render: function() {
        var d = new Date(this.props.event.createdAt);
        return (
            <tr>
                <td>
                    {d.getDate() + "." + d.getMonth() + "." + d.getFullYear()}<br />
                    kl. {d.getHours() + "." + d.getMinutes()}
                </td>
                <td>
                    {this.props.event.type}
                </td>
                <td>
                    <code className='JSON'>{JSON.stringify(this.props.event.data)}</code>
                </td>
                <td>{this.props.event.createdBy}</td>
            </tr>
        );
    }
});

module.exports = LogEntry;