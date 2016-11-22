import React, { PropTypes, Component } from 'react';

import FontIcon from 'react-toolbox/lib/font_icon';

import style from './history.scss';

const DIFF_PREFIXES = {
    A: ' ',
    E: ' ',
    D: '-',
    N: '+',
};

const SPADEN_CLASS = {
    A: style.blue, // array edited
    E: style.blue, // edited
    D: style.negative, // deleted
    N: style.positive, // added
};

class HistoryItem extends Component {

    static propTypes () {
        return {
            entry: PropTypes.object,
        };
    }

    getIcon (type) {
        if (type.indexOf('created') > -1 ) {
            return 'add';
        }

        if (type.indexOf('deleted') > -1 ) {
            return 'remove';
        }

        if (type.indexOf('updated') > -1 ) {
            return 'update';
        }

        if (type.indexOf('archived') > -1 ) {
            return 'archived';
        }
        return 'bookmark';
    }

    buildDiff (diff, idx) {
        let change;
        const key = diff.path.join('.');

        if (diff.lhs !== undefined && diff.rhs !== undefined) {
            change = (
                <div>
                  <div className={SPADEN_CLASS.D}>- {key}: {JSON.stringify(diff.lhs)}</div>
                  <div className={SPADEN_CLASS.N}>+ {key}: {JSON.stringify(diff.rhs)}</div>
                </div>
            );
        } else {
            const spadenClass = SPADEN_CLASS[diff.kind];
            const prefix      = DIFF_PREFIXES[diff.kind];

            change = (<div className={spadenClass}>{prefix} {key}: {JSON.stringify(diff.rhs)}</div>);
        }

        return (<div key={idx}>{change}</div>);
    }

    renderEventDiff (logEntry) {
        if (!logEntry.diffs) {
            return;
        }
        const changes = logEntry.diffs.map(this.buildDiff);
        return (
            <code className="smalltext man">{changes.length === 0 ? '(no changes)' : changes}</code>
        );
    }

    renderFullEventData (logEntry) {
        const localEventData = JSON.parse(JSON.stringify(logEntry));
        delete localEventData.description;
        delete localEventData.name;
        delete localEventData.diffs;

        const prettyPrinted = JSON.stringify(localEventData, null, 2);

        return (<code className="JSON smalltext man">{prettyPrinted}</code>);
    }

    render () {
        const {
            createdBy,
            id,
            type,
        } = this.props.entry;

        const createdAt = (new Date(this.props.entry.createdAt)).toLocaleString('nb-NO');
        const icon = this.getIcon(type);

        const data = this.props.showData ?
            this.renderFullEventData(this.props.entry) : this.renderEventDiff(this.props.entry);

        return (
            <tr>
                <td>
                    <FontIcon value={icon} title={type} /> {type}
                    <dl>
                        <dt>Id:</dt>
                        <dd>{id}</dd>
                        <dt>Type:</dt>
                        <dd>{type}</dd>
                        <dt>Timestamp:</dt>
                        <dd>{createdAt}</dd>
                        <dt>Username:</dt>
                        <dd>{createdBy}</dd>
                    </dl>
                </td>
                <td>{data}</td>
             </tr>
        );
    }
}

export default HistoryItem;
