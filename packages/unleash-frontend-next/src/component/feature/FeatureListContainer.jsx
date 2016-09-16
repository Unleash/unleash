import { connect } from 'react-redux';
import { toggleFeature } from '../../action';
import FeatureList from './FeatureList';

const mapStateToProps = (state) => ({
    features: state.features,
});

const mapDispatchToProps = (dispatch) => ({
    onFeatureClick: (id) => {
        dispatch(toggleFeature(id));
    },
});


const FeatureListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureList);

export default FeatureListContainer;
