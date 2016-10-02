import { connect } from 'react-redux';
import { toggleFeature, fetchFeatureToggles } from '../../store/featureToggleActions';
import FeatureList from './FeatureList';

const mapStateToProps = (state) => ({
    features: state.features,
});

const mapDispatchToProps = {
    onFeatureClick: toggleFeature,
    fetchFeatureToggles,
};

const FeatureListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureList);

export default FeatureListContainer;
