import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Card } from '@material-ui/core';
import HistoryList from './history-list-container';
import { styles as commonStyles } from '../common';

class History extends PureComponent {
    static propTypes = {
        fetchHistory: PropTypes.func.isRequired,
        history: PropTypes.array.isRequired,
    };

    componentDidMount() {
        this.props.fetchHistory();
    }

    toggleShowDiff() {
        this.setState({ showData: !this.state.showData });
    }

    render() {
        const { history } = this.props;
        if (history.length < 0) {
            return;
        }

        return (
            <Card className={commonStyles.fullwidth}>
                <HistoryList history={history} title="Recent changes" />
            </Card>
        );
    }
}
export default History;
