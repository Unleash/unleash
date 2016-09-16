import React, { Component } from 'react';
import FeatureListContainer from '../../component/feature/FeatureListContainer';
import AddFeatureToggle from '../../component/feature/AddFeatureToggle';

export default class Features extends Component {
    render () {
        return (
                <div>
                    <h1>Feature Toggles</h1>
                    <AddFeatureToggle />
                    <FeatureListContainer />

                </div>

        );
    }
};
