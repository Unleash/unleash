import React, { Component } from 'react';
import { Link } from 'react-router';
import { ListSubHeader, List, ListItem, ListDivider } from 'react-toolbox';

export default class UnleashNav extends Component {
    render () {
        return (
                <List selectable ripple>
                    <Link to="/"><ListItem selectable className="active" caption="Feature Toggles" /></Link>
                    <Link to="/strategies"><ListItem selectable caption="Strategies" /></Link>
                    <Link to="/logs"><ListItem selectable caption="Log" /></Link>
                    <Link to="/archive"><ListItem selectable caption="Archive" /></Link>
                    <ListDivider />
                    <ListSubHeader Resources/>
                    <Link to="/archive"><ListItem selectable caption="Documentation" /></Link>
                    <a href="https://github.com/finn-no/unleash/" target="_blank"><ListItem selectable caption="GitHub" /></a>
                    <ListDivider />
                    <ListItem selectable={false} ripple="false">
                        <p>A product by <a href="https://finn.no" target="_blank">FINN.no</a></p>
                    </ListItem>
                </List>

        );
    }
};
