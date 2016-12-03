import React, { PropTypes, PureComponent } from 'react';

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

function getIcon (type) {
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
                <div className={SPADEN_CLASS.D}>- {key}: {JSON.stringify(diff.lhs)}</div>
            </div>
        );
    } else if (diff.rhs !== undefined) {
        change = (
            <div>
                <div className={SPADEN_CLASS.N}>+ {key}: {JSON.stringify(diff.rhs)}</div>
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
                <div className={SPADEN_CLASS.D}>- {key}: {JSON.stringify(diff.lhs)}</div>
                <div className={SPADEN_CLASS.N}>+ {key}: {JSON.stringify(diff.rhs)}</div>
            </div>
        );
    } else {
        const spadenClass = SPADEN_CLASS[diff.kind];
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
        const { type } = this.props.entry;

        const icon = getIcon(type);

        const localEventData = JSON.parse(JSON.stringify(this.props.entry));
        delete localEventData.description;
        delete localEventData.name;
        delete localEventData.diffs;

        const prettyPrinted = JSON.stringify(localEventData, null, 2);

        return (
            <div className={style['history-item']}>
                <div>
                    <code className="JSON smalltext man">{prettyPrinted}</code>
                </div>
            </div>
        );
    }
}

export default HistoryItem;
