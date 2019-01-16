import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { List, ListItem, ListItemContent, IconButton, Grid, Cell } from 'react-mdl';
import { HeaderTitle } from '../common';
import { CREATE_STRATEGY, DELETE_STRATEGY } from '../../permissions';

class StrategiesListComponent extends Component {
    static propTypes = {
        strategies: PropTypes.array.isRequired,
        fetchStrategies: PropTypes.func.isRequired,
        removeStrategy: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        hasPermission: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.fetchStrategies();
    }

    render() {
        const { strategies, removeStrategy, hasPermission } = this.props;

        return (
            <Grid className="mdl-color--white">
                <Cell col={12}>
                    <HeaderTitle
                        title="Strategies"
                        actions={
                            hasPermission(CREATE_STRATEGY) ? (
                                <IconButton
                                    raised
                                    name="add"
                                    onClick={() => this.props.history.push('/strategies/create')}
                                    title="Add new strategy"
                                />
                            ) : (
                                ''
                            )
                        }
                    />
                    <List>
                        {strategies.length > 0 ? (
                            strategies.map((strategy, i) => (
                                <ListItem key={i} twoLine>
                                    <ListItemContent icon="extension" subtitle={strategy.description}>
                                        <Link to={`/strategies/view/${strategy.name}`}>
                                            <strong>{strategy.name}</strong>
                                        </Link>
                                    </ListItemContent>
                                    {strategy.editable === false || !hasPermission(DELETE_STRATEGY) ? (
                                        ''
                                    ) : (
                                        <IconButton name="delete" onClick={() => removeStrategy(strategy)} />
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
