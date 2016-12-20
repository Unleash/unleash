import React, { Component } from 'react';
import { Link } from 'react-router';

import { List, ListItem, ListItemContent, IconButton } from 'react-mdl';
import { HeaderTitle } from '../common';

class StrategiesListComponent extends Component {

    static contextTypes = {
        router: React.PropTypes.object,
    }

    componentDidMount () {
        this.props.fetchStrategies();
    }

    render () {
        const { strategies, removeStrategy } = this.props;

        return (
            <div>
                <HeaderTitle title="Strategies"
                    actions={
                        <IconButton raised
                            name="add"
                            onClick={() => this.context.router.push('/strategies/create')}
                            title="Add new strategy" />} />
                <List>
                    {strategies.length > 0 ? strategies.map((strategy, i) => (
                            <ListItem key={i} twoLine>
                                <ListItemContent icon="extension" subtitle={strategy.description}>
                                    <Link to={`/strategies/view/${strategy.name}`}>
                                        <strong>{strategy.name}</strong>
                                    </Link>
                                    </ListItemContent>
                                <IconButton name="delete" onClick={() => removeStrategy(strategy)} />
                            </ListItem>
                        )) : <ListItem>No entries</ListItem>}
                </List>
            </div>
        );
    }
}


export default StrategiesListComponent;
