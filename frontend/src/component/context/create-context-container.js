import { connect } from 'react-redux';
import ContextComponent from './form-context-component';
import { createContextField, validateName } from './../../store/context/actions';

const mapStateToProps = (state, props) => {
    let contextField = { name: '', description: '', legalValues: [] };
    if (props.contextFieldName) {
        contextField = state.context.toJS().find(n => n.name === props.contextFieldName);
    }
    return {
        contextField,
    };
};

const mapDispatchToProps = dispatch => ({
    validateName,
    submit: contextField => createContextField(contextField)(dispatch),
});

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(ContextComponent);

export default FormAddContainer;
