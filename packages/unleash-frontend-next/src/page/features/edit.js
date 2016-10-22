import React, { Component } from 'react';
import EditFeatureToggle from '../../component/feature/EditFeatureToggle';

export default class Features extends Component {
    static contextTypes = {
        router: React.PropTypes.object,
    }

    render () {
        return (
            <div>
                <h1>Edit Feature Toggle</h1>
                <EditFeatureToggle featureToggleName={this.props.params.name} />
            </div>
        );
    }
};
