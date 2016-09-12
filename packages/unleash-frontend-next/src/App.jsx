import React, { Component } from 'react';
import { AppBar } from 'react-toolbox';

import Navigation from './Navigation';

export default class App extends Component {
    render () {
        return (
            <div>
                <AppBar flat leftIcon="(Unleash)">
                    <Navigation />
                </AppBar>
                {this.props.children}
            </div>
        );
    }
};
