import { connect } from 'react-redux';
import Component from './FeatureToggleListItemChip';

const mapStateToProps = state => ({
    types: state.featureTypes.toJS(),
});

const FeatureType = connect(mapStateToProps)(Component);

export default FeatureType;
