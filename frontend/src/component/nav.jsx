import React, { Component } from 'react';
import { ListSubHeader, List, ListItem, ListDivider } from 'react-toolbox';
import style from './styles.scss';

export default class UnleashNav extends Component {
    static contextTypes = {
        router: React.PropTypes.object,
    }

    render () {
        const createListItem = (path, caption) =>
            <ListItem to={this.context.router.createHref(path)} caption={caption}
                className={this.context.router.isActive(path) ? style.active : ''} />;

        return (
                <List selectable ripple className={style.navigation}>
                    {createListItem('/features', 'Feature toggles')}
                    {createListItem('/strategies', 'Strategies')}
                    {createListItem('/history', 'Event history')}
                    {createListItem('/archive', 'Archived toggles')}

                    <ListDivider />

                    <ListSubHeader caption="Clients" />
                    {createListItem('/metrics', 'Client metrics')}
                    {createListItem('/client-strategies', 'Client strategies')}
                    {createListItem('/client-instances', 'Client instances')}

                    <ListDivider />

                    <ListSubHeader caption="Resources" />
                    {createListItem('/docs', 'Documentation')}
                    <a href="https://github.com/finn-no/unleash/" target="_blank">
                        <ListItem caption="GitHub" />
                    </a>

                    <ListDivider />
                    <ListItem selectable={false} ripple={false}>
                        <p>A product by <a href="https://finn.no" target="_blank">FINN.no</a></p>
                    </ListItem>
                </List>

        );
    }
};
