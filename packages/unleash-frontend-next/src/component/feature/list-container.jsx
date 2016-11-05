import { connect } from 'react-redux';
import { toggleFeature, fetchFeatureToggles, removeFeatureToggle } from '../../store/feature-actions';
import { fetchFeatureMetrics } from '../../store/feature-metrics-actions';

import FeatureListComponent from './list-component';

const mapStateToProps = (state) => ({
    features: state.features.toJS(),
    featureMetrics: state.featureMetrics.toJS(),
});

const mapDispatchToProps = {
    onFeatureClick: toggleFeature,
    onFeatureRemove: removeFeatureToggle,
    fetchFeatureToggles,
    fetchFeatureMetrics,
};

const FeatureListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureListComponent);

export default FeatureListContainer;
