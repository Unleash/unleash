import React, { Component, PropTypes } from 'react';
import EditFeatureToggle from '../../component/feature/EditFeatureToggle';

export default class Features extends Component {
    static propTypes () {
        return {
            params: PropTypes.object.isRequired,
        };
    }

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
