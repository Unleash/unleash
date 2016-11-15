import React, { PropTypes } from 'react';

import { connect } from 'react-redux';
import EditFeatureToggle from './form-edit-container.jsx';
import { fetchFeatureToggles } from '../../store/feature-actions';

class EditFeatureToggleWrapper extends React.Component {

    static propTypes () {
        return {
            featureToggleName: PropTypes.string.isRequired,
            features: PropTypes.array.isRequired,
            fetchFeatureToggles: PropTypes.array.isRequired,
        };
    }

    componentWillMount () {
        if (this.props.features.length === 0) {
            this.props.fetchFeatureToggles();
        }
    }

    render () {
        const { features, featureToggleName } = this.props;

        const featureToggle = features.find(toggle => toggle.name === featureToggleName);

        if (featureToggle) {
            return <EditFeatureToggle featureToggle={featureToggle} />;
        } else if (features.length === 0 ) {
            return <span>Loading</span>;
        } else  {
            return <span>Could not find {this.props.featureToggleName}</span>;
        }
    }
}


export default connect((state) => ({
    features: state.features.toJS(),
}), { fetchFeatureToggles })(EditFeatureToggleWrapper);
