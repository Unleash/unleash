import React, { Component } from 'react';
import HistoryItem from './history-item';
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

        const entries =  history.map((entry) => <HistoryItem  key={`log${entry.id}`} entry={entry} showData={showData} />);

        return (
            <div>
                <Switch
                    checked={showData}
                    label="Show full events"
                    onChange={this.toggleShowDiff.bind(this)}
                    />
                <table className={style.history}>
                    <tbody>
                        {entries}
                    </tbody>
                </table>
            </div>
        );
    }
}
export default HistoryList;
