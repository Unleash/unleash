import React, { Component } from 'react';
import { List, ListItem, ListSubHeader, ListDivider } from 'react-toolbox/lib/list';
import FontIcon from 'react-toolbox/lib/font_icon';
import Chip from 'react-toolbox/lib/chip';

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
            <List ripple >
                <ListSubHeader caption="Strategies" />
                {strategies.length > 0 ? strategies.map((strategy, i) => {
                    const actions = this.getParameterMap(strategy).concat([
                        <button className={style['non-style-button']} key="1" onClick={() => removeStrategy(strategy)}>
                            <FontIcon value="delete" />
                        </button>,
                    ]);


                    return (
                        <ListItem key={i} rightActions={actions}
                            caption={strategy.name}
                            legend={strategy.description} />
                    );
                }) : <ListItem caption="No entries" />}
                <ListDivider />
                <ListItem
                    onClick={() => this.context.router.push('/strategies/create')}
                    caption="Add" legend="new strategy" leftIcon="add" />
            </List>
        );
    }
}


export default StrategiesListComponent;
