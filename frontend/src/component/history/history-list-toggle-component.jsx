import React, { Component, PropTypes } from 'react';
import ListComponent from './history-list-container';
import { fetchHistoryForToggle } from '../../data/history-api';

class HistoryListToggle extends Component {

    constructor (props) {
        super(props);
        this.state = {
            fetching: true,
            history: undefined,
        };
    }

    static propTypes () {
        return {
            toggleName: PropTypes.string.isRequired,
        };
    }

    componentDidMount () {
        fetchHistoryForToggle(this.props.toggleName)
            .then((res) => this.setState({ history: res.events, fetching: false }));
    }

    render () {
        if (this.state.fetching) {
            return <span>fetching..</span>;
        }

        return (
            <div>
                <h5>Showing history for toggle: <strong>{this.props.toggleName}</strong></h5>
                <ListComponent history={this.state.history} />
            </div>
        );
    }
}
export default HistoryListToggle;
