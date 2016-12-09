import React, { Component, PropTypes } from 'react';
import ListComponent from './history-list-container';
import { Link } from 'react-router';

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
        const { history, toggleName } = this.props;
        return (
            <div>
                <h5>Showing history for toggle: <Link to={`/features/edit/${toggleName}`}><strong>{toggleName}</strong></Link></h5>
                <ListComponent history={history} />
            </div>
        );
    }
}

export default HistoryListToggle;
