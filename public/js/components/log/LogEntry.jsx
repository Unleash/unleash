var React = require('react');

var LogEntry = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    render: function() {
        var d = new Date(this.props.event.createdAt);
        var localEventData = JSON.parse(JSON.stringify(this.props.event.data));
        delete localEventData.description;
        delete localEventData.name;
        return (
            <tr>
                <td>
                    {d.getDate() + "." + d.getMonth() + "." + d.getFullYear()}<br />
                    kl. {d.getHours() + "." + d.getMinutes()}
                </td>
                <td>
                    <strong>{this.props.event.data.name}</strong><em>[{this.props.event.type}]</em>
                </td>
                <td style={{maxWidth: 300}}>
                    <code className='JSON smalltext man'>{JSON.stringify(localEventData, null, 2)}</code>
                </td>
                <td>{this.props.event.createdBy}</td>
            </tr>
        );
    }
});

module.exports = LogEntry;