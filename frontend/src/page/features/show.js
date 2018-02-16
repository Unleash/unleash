import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ViewFeatureToggle from './../../component/feature/view-container';

export default class Features extends PureComponent {
    static propTypes = {
        params: PropTypes.object.isRequired,
    };

    render() {
        const { params } = this.props;
        return <ViewFeatureToggle featureToggleName={params.name} activeTab={params.activeTab} />;
    }
}
