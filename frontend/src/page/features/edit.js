import React, { Component, PropTypes } from 'react';
import EditFeatureToggleForm from '../../component/feature/form-edit-container';

export default class Features extends Component {
    static propTypes () {
        return {
            params: PropTypes.object.isRequired,
        };
    }

    render () {
        return (
            <div>
                <h3>Edit feature toggle</h3>
                <EditFeatureToggleForm featureToggleName={this.props.params.name} />
            </div>
        );
    }
};
