import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { List, ListItem, ListItemContent, IconButton, Card } from 'react-mdl';
import { HeaderTitle, styles as commonStyles } from '../common';
import { CREATE_STRATEGY, DELETE_STRATEGY } from '../../permissions';

import styles from './strategies.module.scss';

class StrategiesListComponent extends Component {
    static propTypes = {
        strategies: PropTypes.array.isRequired,
        fetchStrategies: PropTypes.func.isRequired,
        removeStrategy: PropTypes.func.isRequired,
        deprecateStrategy: PropTypes.func.isRequired,
        reactivateStrategy: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        hasPermission: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.fetchStrategies();
    }

    render() {
        const { strategies, removeStrategy, hasPermission, reactivateStrategy, deprecateStrategy } = this.props;

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
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
                            <ListItem key={i} twoLine className={strategy.deprecated ? styles.deprecated : ''}>
                                <ListItemContent icon="extension" subtitle={strategy.description}>
                                    <Link
                                        to={`/strategies/view/${strategy.name}`}
                                        title={strategy.deprecated ? 'Deprecated' : ''}
                                    >
                                        <strong>{strategy.name}</strong>
                                        {strategy.deprecated ? <small> (Deprecated)</small> : null}
                                    </Link>
                                </ListItemContent>
                                <span>
                                    {strategy.deprecated ? (
                                        <IconButton
                                            name="visibility"
                                            title="Reactivate activation strategy"
                                            onClick={() => reactivateStrategy(strategy)}
                                        />
                                    ) : (
                                        <IconButton
                                            name="visibility_off"
                                            title="Deprecate activation strategy"
                                            disabled={strategy.name === 'default'}
                                            color="#"
                                            onClick={() => deprecateStrategy(strategy)}
                                        />
                                    )}
                                    {strategy.editable === false || !hasPermission(DELETE_STRATEGY) ? (
                                        <IconButton
                                            name="delete"
                                            title="You can not delete a built-in strategy"
                                            disabled
                                            onClick={() => {}}
                                        />
                                    ) : (
                                        <IconButton
                                            name="delete"
                                            title="Delete activation strategy"
                                            onClick={() => removeStrategy(strategy)}
                                        />
                                    )}
                                </span>
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>No entries</ListItem>
                    )}
                </List>
            </Card>
        );
    }
}

export default StrategiesListComponent;
