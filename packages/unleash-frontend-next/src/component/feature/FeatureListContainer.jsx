import { connect } from 'react-redux';
import { toggleFeature, fetchFeatureToggles, removeFeatureToggle } from '../../store/feature-actions';
import FeatureList from './FeatureList';

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
)(FeatureList);

export default FeatureListContainer;
