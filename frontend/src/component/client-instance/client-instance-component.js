import React, { Component, PropTypes } from 'react';
import { DataTable, TableHeader } from 'react-mdl';

class ClientStrategies extends Component {
    static propTypes = {
        fetchClientInstances: PropTypes.func.isRequired,
        clientInstances: PropTypes.array.isRequired,
    }

    componentDidMount () {
        this.props.fetchClientInstances();
    }

    render () {
        const source = this.props.clientInstances;

        return (
            <DataTable
                style={{ width: '100%' }}
                rows={source}
                selectable={false}
            >


                <TableHeader name="instanceId">Instance ID</TableHeader>
                <TableHeader name="appName">Application name</TableHeader>
                <TableHeader name="clientIp">IP</TableHeader>
                <TableHeader name="createdAt">Created</TableHeader>
                <TableHeader name="lastSeen">Last Seen</TableHeader>

            </DataTable>
        );
    }
}


export default ClientStrategies;
