import React, { Component } from 'react';
import { Link } from 'react-router';
import { Navigation } from 'react-toolbox';

export default class UnleashNav extends Component {
    render () {
        return (
            <Navigation type="horizontal">
                <Link to="/features">Feature Toggles </Link>
                <Link to="/strategies">Strategies </Link>
                <a href="https://github.com/finn-no/unleash/" target="_blank">GitHub </a>
            </Navigation>
        );
    }
};
