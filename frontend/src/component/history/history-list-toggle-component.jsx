import React, { Component, PropTypes } from 'react';
import ListComponent from './history-list-container';

class HistoryListToggle extends Component {

    static propTypes () {
        return {
            toggleName: PropTypes.string.isRequired,
        };
    }

    componentDidMount () {
        this.props.fetchHistoryForToggle(this.props.toggleName);
    }

    render () {
        if (!this.props.history || this.props.history.length === 0) {
            return <span>fetching..</span>;
        }

        return (
            <div>
                <h5>Showing history for toggle: <strong>{this.props.toggleName}</strong></h5>
                <ListComponent history={this.props.history} />
            </div>
        );
    }
}

export default HistoryListToggle;
