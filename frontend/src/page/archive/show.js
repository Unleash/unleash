import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ViewFeatureToggle from './../../component/archive/view-container';

export default class Features extends PureComponent {
    static propTypes = {
        match: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    render() {
        const { match, history } = this.props;
        return (
            <ViewFeatureToggle
                history={history}
                featureToggleName={match.params.name}
                activeTab={match.params.activeTab}
            />
        );
    }
}
