import React, { PureComponent, PropTypes } from 'react';
import ViewFeatureToggle from '../../component/feature/view-container';

export default class Features extends PureComponent {
    static propTypes = {
        params: PropTypes.object.isRequired,
    }

    render () {
        const { params } = this.props;
        return (
            <ViewFeatureToggle featureToggleName={params.name} activeTab={params.activeTab} />
        );
    }
};
