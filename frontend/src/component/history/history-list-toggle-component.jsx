import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HistoryList from './history-list-container';

class HistoryListToggle extends Component {
    static propTypes = {
        toggleName: PropTypes.string.isRequired,
    };

    componentDidMount() {
        this.props.fetchHistoryForToggle(this.props.toggleName);
    }

    render() {
        if (!this.props.history || this.props.history.length === 0) {
            return <span>fetching..</span>;
        }
        const { history } = this.props;
        return <HistoryList history={history} title="Change log" />;
    }
}

export default HistoryListToggle;
