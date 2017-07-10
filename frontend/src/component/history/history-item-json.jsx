import React, { PropTypes, PureComponent } from 'react';

import style from './history.scss';

class HistoryItem extends PureComponent {
    static propTypes = {
        entry: PropTypes.object,
    }

    render () {
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
