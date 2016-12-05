import React, { Component } from 'react';
import { Link } from 'react-router';

import { List, ListItem, ListItemContent, IconButton, Chip } from 'react-mdl';

class StrategiesListComponent extends Component {

    static contextTypes = {
        router: React.PropTypes.object,
    }

    componentDidMount () {
        this.props.fetchStrategies();
    }

    getParameterMap ({ parametersTemplate }) {
        return Object.keys(parametersTemplate || {}).map(k => (
            <Chip key={k}><small>{k}</small></Chip>
        ));
    }

    render () {
        const { strategies, removeStrategy } = this.props;

        return (
            <div>
            <h5>Strategies</h5>
            <IconButton name="add" onClick={() => this.context.router.push('/strategies/create')} title="Add new strategy"/>

            <hr />
            <List>
                {strategies.length > 0 ? strategies.map((strategy, i) => {
                    return (
                        <ListItem key={i}>
                            <ListItemContent>
                                <Link to={`/strategies/view/${strategy.name}`}>
                                    <strong>{strategy.name}</strong>
                                </Link> 
                                <span> {strategy.description}</span></ListItemContent>
                            <IconButton name="delete" onClick={() => removeStrategy(strategy)} />
                        </ListItem>
                    );
                }) : <ListItem>No entries</ListItem>}
                

            </List>
            </div>
        );
    }
}


export default StrategiesListComponent;
