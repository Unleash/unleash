import React, { Component } from 'react';
import HistoryList from './history-list-container';

class History extends Component {

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

        return (
            <div>
                <h5>Last 100 changes</h5>
                <HistoryList history={history} />
            </div>
        );
    }
}
export default History;
