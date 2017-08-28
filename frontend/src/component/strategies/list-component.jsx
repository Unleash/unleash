import React, { Component } from 'react';
import { Link } from 'react-router';

import {
    List,
    ListItem,
    ListItemContent,
    IconButton,
    Grid,
    Cell,
} from 'react-mdl';
import { HeaderTitle } from '../common';

class StrategiesListComponent extends Component {
    static contextTypes = {
        router: React.PropTypes.object,
    };

    componentDidMount() {
        this.props.fetchStrategies();
    }

    render() {
        const { strategies, removeStrategy } = this.props;

        return (
            <Grid className="mdl-color--white">
                <Cell col={12}>
                    <HeaderTitle
                        title="Strategies"
                        actions={
                            <IconButton
                                raised
                                name="add"
                                onClick={() =>
                                    this.context.router.push(
                                        '/strategies/create'
                                    )}
                                title="Add new strategy"
                            />
                        }
                    />
                    <List>
                        {strategies.length > 0 ? (
                            strategies.map((strategy, i) => (
                                <ListItem key={i} twoLine>
                                    <ListItemContent
                                        icon="extension"
                                        subtitle={strategy.description}
                                    >
                                        <Link
                                            to={`/strategies/view/${strategy.name}`}
                                        >
                                            <strong>{strategy.name}</strong>
                                        </Link>
                                    </ListItemContent>
                                    {strategy.editable === false ? (
                                        ''
                                    ) : (
                                        <IconButton
                                            name="delete"
                                            onClick={() =>
                                                removeStrategy(strategy)}
                                        />
                                    )}
                                </ListItem>
                            ))
                        ) : (
                            <ListItem>No entries</ListItem>
                        )}
                    </List>
                </Cell>
            </Grid>
        );
    }
}

export default StrategiesListComponent;
