import React, { Component } from 'react';
import { DataTable, TableHeader }  from 'react-mdl';

class ClientStrategies extends Component {

    componentDidMount () {
        this.props.fetchClientStrategies();
    }

    render () {
        const source = this.props.clientStrategies
        // temp hack for ignoring dumb data
        .filter(item => item.strategies)
        .map(item => (
            {
                appName: item.appName,
                strategies: item.strategies && item.strategies.join(', '),
            })
        );

        return (
            <DataTable
                style={{ width: '100%' }}
                rows={source}
                selectable={false}
            >
                <TableHeader name="appName">Application name</TableHeader>
                <TableHeader name="strategies">Strategies</TableHeader>
            </DataTable>
        );
    }
}


export default ClientStrategies;
