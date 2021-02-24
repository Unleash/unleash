import { connect } from 'react-redux';
import ContextComponent from './form-context-component';
import { updateContextField, validateName } from './../../store/context/actions';

const mapStateToProps = (state, props) => {
    const contextFieldBase = { name: '', description: '', legalValues: [] };
    const field = state.context.toJS().find(n => n.name === props.contextFieldName);
    const contextField = Object.assign(contextFieldBase, field);
    if (!field) {
        contextField.initial = true;
    }

    return {
        contextField,
    };
};

const mapDispatchToProps = dispatch => ({
    validateName,
    submit: contextField => updateContextField(contextField)(dispatch),
    editMode: true,
});

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(ContextComponent);

export default FormAddContainer;
