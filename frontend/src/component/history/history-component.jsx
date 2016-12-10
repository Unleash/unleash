import React, { PureComponent } from 'react';
import HistoryList from './history-list-container';

class History extends PureComponent {

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
            <HistoryList history={history} title="Last 100 changes" />
        );
    }
}
export default History;
