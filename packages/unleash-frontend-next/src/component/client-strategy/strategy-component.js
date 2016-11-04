import React, { Component } from 'react';
import Table from 'react-toolbox/lib/table';

const Model = {
    appName: { type: String, title: 'Application Name' },
    strategies: { type: String },
};

class ClientStrategies extends Component {

    componentDidMount () {
        this.props.fetchClientStrategies();
    }

    render () {
        const source = this.props.clientStrategies.map(item => (
            {
                appName: item.appName,
                strategies: item.strategies.join(', '),
            })
        );

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
