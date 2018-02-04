import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-mdl';
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
            <Card shadow={0} className={commonStyles.fullwidth}>
                <HistoryList history={history} title="Recent changes" />
            </Card>
        );
    }
}
export default History;
