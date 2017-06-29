import React, { PureComponent } from 'react';
import { Card } from 'react-mdl';
import HistoryList from './history-list-container';
import { styles as commonStyles } from '../common';

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
            <Card shadow={0} className={commonStyles.fullwidth}>
                <HistoryList history={history} title="Recent changes" />
            </Card>
        );
    }
}
export default History;
