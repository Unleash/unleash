import React, { PropTypes, PureComponent } from 'react';
import { Icon } from 'react-mdl';

import style from './history.scss';

const DIFF_PREFIXES = {
    A: ' ',
    E: ' ',
    D: '-',
    N: '+',
};

const KLASSES = {
    A: style.blue, // array edited
    E: style.blue, // edited
    D: style.negative, // deleted
    N: style.positive, // added
};

export function getIcon (type) {
    switch (type) {
        case 'feature-updated': return 'autorenew';
        case 'feature-created': return 'add';
        case 'feature-deleted': return 'remove';
        case 'feature-archived': return 'archived';
        default: return 'star';
    }
}

function buildItemDiff (diff, key) {
    let change;
    if (diff.lhs !== undefined) {
        change = (
            <div>
                <div className={KLASSES.D}>- {key}: {JSON.stringify(diff.lhs)}</div>
            </div>
        );
    } else if (diff.rhs !== undefined) {
        change = (
            <div>
                <div className={KLASSES.N}>+ {key}: {JSON.stringify(diff.rhs)}</div>
            </div>
        );
    }

    return change;
}

function buildDiff (diff, idx) {
    let change;
    const key = diff.path.join('.');

    if (diff.item) {
        change = buildItemDiff(diff.item, key);
    } else if (diff.lhs !== undefined && diff.rhs !== undefined) {
        change = (
            <div>
                <div className={KLASSES.D}>- {key}: {JSON.stringify(diff.lhs)}</div>
                <div className={KLASSES.N}>+ {key}: {JSON.stringify(diff.rhs)}</div>
            </div>
        );
    } else {
        const spadenClass = KLASSES[diff.kind];
        const prefix      = DIFF_PREFIXES[diff.kind];

        change = (<div className={spadenClass}>{prefix} {key}: {JSON.stringify(diff.rhs || diff.item)}</div>);
    }

    return (<div key={idx}>{change}</div>);
}

class HistoryItem extends PureComponent {

    static propTypes () {
        return {
            entry: PropTypes.object,
        };
    }

    renderEventDiff (logEntry) {
        let changes;

        if (logEntry.diffs) {
            changes = logEntry.diffs.map(buildDiff);
        } else {
            // Just show the data if there is no diff yet.
            changes = <div className={KLASSES.N}>{JSON.stringify(logEntry.data, null, 2)}</div>;
        }

        return <code className="smalltext man">{changes.length === 0 ? '(no changes)' : changes}</code>;
    }

    render () {
        const {
            createdBy,
            id,
            type,
        } = this.props.entry;

        const createdAt = (new Date(this.props.entry.createdAt)).toLocaleString('nb-NO');
        const icon = getIcon(type);

        const data = this.renderEventDiff(this.props.entry);

        return data;

        return (
            <div className={style['history-item']}>
                <dl>
                    <dt>Id:</dt>
                    <dd>{id}</dd>
                    <dt>Type:</dt>
                    <dd>
                        <Icon name={icon} title={type} style={{ fontSize: '1.6rem' }} />
                        <span> {type}</span>
                    </dd>
                    <dt>Timestamp:</dt>
                    <dd>{createdAt}</dd>
                    <dt>Username:</dt>
                    <dd>{createdBy}</dd>
                    <dt>Diff</dt>
                    <dd>{data}</dd>
                </dl>
             </div>
        );
    }
}

export default HistoryItem;
