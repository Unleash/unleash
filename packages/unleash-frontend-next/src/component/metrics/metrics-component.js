import React, { Component } from 'react';
import { List, ListItem, ListSubHeader, ListDivider } from 'react-toolbox/lib/list';
import Chip from 'react-toolbox/lib/chip';

class Metrics extends Component {

    componentDidMount () {
        this.props.fetchMetrics();
    }

    render () {
        const { globalCount, clientList } = this.props;

        return (
            <List>
                <ListSubHeader caption={<span>Total of {globalCount} toggles </span>} />
                <ListDivider />
                {clientList.map(({ name, count, ping, appName }, i) =>
                    <ListItem
                        leftActions={[<Chip>{count}</Chip>]}
                        key={name + i}
                        caption={appName}
                        legend={`${name} pinged ${ping}`} />
                )}
            </List>
        );
    }
}


export default Metrics;
