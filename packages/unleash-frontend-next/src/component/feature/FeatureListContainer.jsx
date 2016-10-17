import { connect } from 'react-redux';
import { toggleFeature, fetchFeatureToggles } from '../../store/feature-actions';
import FeatureList from './FeatureList';

const mapStateToProps = (state) => ({
    features: state.features.toJS(),
    strategies: state.strategies.toJS(),
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
