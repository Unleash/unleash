import React, { Component } from 'react';

import { List, ListItem, ListItemContent, Icon, IconButton, Chip } from 'react-mdl';

import style from './strategies.scss';

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
                            <ListItemContent><strong>{strategy.name}</strong> {strategy.description}</ListItemContent>
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
