import { connect } from 'react-redux';
import CopyFeatureComponent from './CopyFeature';
import {
    validateName
} from '../../../../store/feature-toggle/actions';

const mapStateToProps = (state, props) => ({
    history: props.history,
});

const mapDispatchToProps = dispatch => ({
    validateName,
});

const FormAddContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CopyFeatureComponent);

export default FormAddContainer;
