import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import RedirectFeatureView from '../../component/feature/RedirectFeatureView';

export default class RedirectFeatureViewPage extends PureComponent {
    static propTypes = {
        match: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    render() {
        const {
            match: { params },
            history,
        } = this.props;
        return (
            <RedirectFeatureView
                featureToggleName={params.name}
                activeTab={params.activeTab}
                history={history}
            />
        );
    }
}
