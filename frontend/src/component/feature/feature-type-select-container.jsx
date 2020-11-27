import { connect } from 'react-redux';
import FeatureTypeSelectComponent from './feature-type-select-component';
import { fetchFeatureTypes } from './../../store/feature-type/actions';

const mapStateToProps = state => ({
    types: state.featureTypes.toJS(),
});

const FormAddContainer = connect(mapStateToProps, { fetchFeatureTypes })(FeatureTypeSelectComponent);

export default FormAddContainer;
