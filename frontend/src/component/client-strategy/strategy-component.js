import React, { Component } from 'react';
import { DataTable, TableHeader }  from 'react-mdl';
import { Link } from 'react-router';

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
                appName: <Link to={`/applications/${item.appName}`}>{item.appName}</Link>,
                strategies: item.strategies && item.strategies.map(name => (<Link to={`/strategies/${name}`}>{name}</Link>)),
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
