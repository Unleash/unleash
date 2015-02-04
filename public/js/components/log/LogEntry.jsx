var React = require('react');
var moment = require('moment');

var DIFF_PREFIXES = {
    A: ' ',
    E: ' ',
    D: '-',
    N: '+'
}

var SPADEN_CLASS = {
    A: 'blue', // array edited
    E: 'blue', // edited
    D: 'negative', // deleted
    N: 'positive', // added
}

var LogEntry = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    render: function() {
        var date = moment(this.props.event.createdAt);

        return (
            <tr>
            <td>
              {date.format('ll')}<br />
              {date.format('HH:mm')}
            </td>
            <td>
            <strong>{this.props.event.data.name}</strong><em>[{this.props.event.type}]</em>
            </td>
            <td style={{maxWidth: 300}}>
              {this.renderEventDiff()}
            </td>
            <td>{this.props.event.createdBy}</td>
            </tr>
        );
    },

    renderFullEventData: function() {
        var localEventData = JSON.parse(JSON.stringify(this.props.event.data));
        delete localEventData.description;
        delete localEventData.name;

        var prettyPrinted = JSON.stringify(localEventData, null, 2);

        return (<code className='JSON smalltext man'>{prettyPrinted}</code>)
    },

    renderEventDiff: function() {
        if (!this.props.showFullEvents && this.props.event.diffs) {
            var changes = this.props.event.diffs.map(this.buildDiff);
            return (<code className='smalltext man'>{changes.length === 0 ? '(no changes)' : changes}</code>)
        } else {
            return this.renderFullEventData();
        }
    },

    buildDiff: function(diff, idx) {
        var change;
        var key = diff.path.join('.');

        if (diff.lhs !== undefined && diff.rhs !== undefined) {
            change = (
                <div>
                  <div className={SPADEN_CLASS.D}>- {key}: {JSON.stringify(diff.lhs)}</div>
                  <div className={SPADEN_CLASS.N}>+ {key}: {JSON.stringify(diff.rhs)}</div>
                </div>
            );
        } else {
            var spadenClass = SPADEN_CLASS[diff.kind]
            var prefix      = DIFF_PREFIXES[diff.kind];

            change = (<div className={spadenClass}>{prefix} {key}: {JSON.stringify(diff.rhs)}</div>)
        }

        return (<div key={idx}>{change}</div>)
    }

});

module.exports = LogEntry;