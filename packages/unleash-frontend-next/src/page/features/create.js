import React, { Component } from 'react';
import AddFeatureToggle from '../../component/feature/AddFeatureToggle';

export default class Features extends Component {
    render () {
        return (
            <div>
                <h1>Create Feature Toggle</h1>
                <AddFeatureToggle />
            </div>
        );
    }
};
