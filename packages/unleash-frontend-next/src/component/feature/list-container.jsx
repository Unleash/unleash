import { connect } from 'react-redux';
import { toggleFeature, fetchFeatureToggles, removeFeatureToggle } from '../../store/feature-actions';
import FeatureListComponent from './list-component';

const mapStateToProps = (state) => ({
    features: state.features.toJS(),
});

const mapDispatchToProps = {
    onFeatureClick: toggleFeature,
    onFeatureRemove: removeFeatureToggle,
    fetchFeatureToggles,
};

const FeatureListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureListComponent);

export default FeatureListContainer;
