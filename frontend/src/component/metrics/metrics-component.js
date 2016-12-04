import React, { Component } from 'react';
import { DataTable, TableHeader } from 'react-mdl';

class Metrics extends Component {

    componentDidMount () {
        this.props.fetchMetrics();
    }

    render () {
        const { globalCount, clientList } = this.props;

        return (
            <div>
                <h4>{`Total of ${globalCount} toggles`}</h4>
                <DataTable
                    style={{ width: '100%' }}
                    rows={clientList}
                    selectable={false}
                >
                    <TableHeader name="name">Instance</TableHeader>
                    <TableHeader name="appName">Application name</TableHeader>
                    <TableHeader numeric name="ping" cellFormatter={
                        (v) => (v.toString()) 
                    }>Last seen</TableHeader>
                    <TableHeader numeric name="count">Counted</TableHeader>
                    
                </DataTable>
            </div>
        );
    }
}


export default Metrics;
