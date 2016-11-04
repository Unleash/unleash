import React, { Component, PropTypes } from 'react';
import Table from 'react-toolbox/lib/table';

const Model = {
    appName: { type: String, title: 'Application Name' },
    instanceId: { type: String },
    clientIp: { type: String },
    createdAt: { type: String },
    lastSeen: { type: String },
};

class ClientStrategies extends Component {
    static propTypes () {
        return {
            fetchClientInstances: PropTypes.func.isRequired,
            clientInstances: PropTypes.array.isRequired,
        };
    }

    componentDidMount () {
        this.props.fetchClientInstances();
    }

    render () {
        const source = this.props.clientInstances;

        return (
            <Table
                model={Model}
                source={source}
                selectable={false}
            />
        );
    }
}


export default ClientStrategies;
