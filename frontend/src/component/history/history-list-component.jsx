import React, { Component } from 'react';
import HistoryItem from './history-item';
import Switch from 'react-toolbox/lib/switch';

import style from './history.scss';

class HistoryList extends Component {

    constructor (props) {
        super(props);
        this.state = { showData: false };
    }

    componentDidMount () {
        this.props.fetchHistory();
    }

    toggleShowDiff () {
        this.setState({ showData: !this.state.showData });
    }

    render () {
        const { history } = this.props;
        if (history.length < 0) {
            return;
        }


        const entries =  history.map((entry) => <HistoryItem  key={`log${entry.id}`} entry={entry} showData={this.state.showData} />);

        return (
            <div>
                <h5>History</h5>
                <Switch
                    checked={this.state.showData}
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
