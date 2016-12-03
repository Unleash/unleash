import React, { Component } from 'react';
import HistoryItemDiff from './history-item-diff';
import HistoryItemJson from './history-item-json';
import Switch from 'react-toolbox/lib/switch';

import style from './history.scss';

class HistoryList extends Component {

    toggleShowDiff () {
        this.props.updateSetting('showData', !this.props.settings.showData);
    }

    render () {
        const showData = this.props.settings.showData;
        const { history } = this.props;
        if (!history || history.length < 0) {
            return null;
        }

        let entries;

        if (showData) {
            entries =  history.map((entry) => <HistoryItemJson  key={`log${entry.id}`} entry={entry} />);
        } else {
            entries =  history.map((entry) => <HistoryItemDiff  key={`log${entry.id}`} entry={entry} />);
        }

        return (
            <div className={style.history}>
                <Switch
                    checked={showData}
                    label="Show full events"
                    onChange={this.toggleShowDiff.bind(this)}
                    />
               {entries}
            </div>
        );
    }
}
export default HistoryList;
