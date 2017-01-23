import React, { PropTypes, PureComponent } from 'react';

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

    render () {
        const entry = this.props.entry;
        let changes;

        if (entry.diffs) {
            changes = entry.diffs.map(buildDiff);
        } else {
            // Just show the data if there is no diff yet.
            changes = <div className={KLASSES.N}>{JSON.stringify(entry.data, null, 2)}</div>;
        }

        return (<pre style={{ maxWidth: '354px', overflowX: 'auto', overflowY: 'hidden', width: 'auto' }}>
            <code className="smalltext man">{changes.length === 0 ? '(no changes)' : changes}</code>
        </pre>);
    }
}

export default HistoryItem;
