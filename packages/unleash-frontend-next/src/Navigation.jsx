import React, { Component } from 'react';
import { Link } from 'react-router';
import { ListSubHeader, List, ListItem } from 'react-toolbox';

export default class UnleashNav extends Component {
    render () {
        return (
                <List selectable ripple>
                    <Link to="/features"><ListItem selectable className="active" caption="Feature Toggles" /></Link>
                    <Link to="/strategies"><ListItem selectable caption="Strategies" /></Link>
                    <a href="https://github.com/finn-no/unleash/" target="_blank"><ListItem selectable caption="GitHub" /></a>
                </List>
        );
    }
};
