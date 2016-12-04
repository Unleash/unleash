import React, { Component, PropTypes } from 'react';
import EditFeatureToggleForm from '../../component/feature/form-edit-wrap';

export default class Features extends Component {
    static propTypes () {
        return {
            params: PropTypes.object.isRequired,
        };
    }

    render () {
        return (
            <EditFeatureToggleForm featureToggleName={this.props.params.name} />
        );
    }
};
