import React, { PureComponent } from 'react';
import { Grid, Cell } from 'react-mdl';
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
            <Grid className="mdl-color--white">
                <Cell col={12}>
                    <HistoryList history={history} title="Last 100 changes" />
                </Cell>
            </Grid>
        );
    }
}
export default History;
