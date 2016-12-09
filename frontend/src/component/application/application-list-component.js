import React, { Component } from 'react';
import { AppsLinkList } from '../common';

class ClientStrategies extends Component {

    componentDidMount () {
        this.props.fetchAll();
    }

    render () {
        const {
            applications,
        } = this.props;

        if (!applications) {
            return <div>Loading...</div>;
        }
        return (
            <div>
                <h5>Applications</h5>
                <hr />
                <AppsLinkList apps={applications} />
            </div>
        );
    }
}


export default ClientStrategies;
