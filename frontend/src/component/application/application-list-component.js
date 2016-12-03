import React, { Component } from 'react';

class ClientStrategies extends Component {

    componentDidMount () {
        this.props.fetchApplications();
    }

    render () {
        if (!this.props.applications) {
            return null;
        }
        const source = this.props.applications.map(item => item.appName).join(', ');

        return (
            <div>
                {source}
            </div>
        );
    }
}


export default ClientStrategies;
