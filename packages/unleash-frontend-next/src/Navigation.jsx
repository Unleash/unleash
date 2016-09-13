import React, { Component } from 'react';
import { Link } from 'react-router';
import { ListSubHeader, List, ListItem } from 'react-toolbox';

export default class UnleashNav extends Component {
    render () {
        return (
                <List>
                    <ListSubHeader caption="Menu" />
                    <ListItem><Link to="/features">Feature Toggles </Link></ListItem>
                    <ListItem><Link to="/strategies">Strategies </Link></ListItem>
                    <ListItem><a href="https://github.com/finn-no/unleash/" target="_blank">GitHub </a></ListItem>
                </List>
        );
    }
};
