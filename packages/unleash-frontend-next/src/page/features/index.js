import React, { Component } from 'react';
import FeatureListContainer from '../../component/feature/FeatureListContainer';
import { Button } from 'react-toolbox';


export default class Features extends Component {
    static contextTypes = {
        router: React.PropTypes.object,
    }

    render () {
        const createHref = this.context.router.createHref('/features/create');
        return (
            <div>
                <h1>Feature Toggles</h1>
                <Button href={createHref} icon="add" label="Create feature toggle"/>
                <FeatureListContainer />
            </div>
        );
    }
};
