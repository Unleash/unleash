import { connect } from 'react-redux';
import ProjectComponent from './form-project-component';
import { createProject, validateId } from './../../store/project/actions';

const mapStateToProps = () => ({
    project: { id: '', name: '', description: '' },
});

const mapDispatchToProps = dispatch => ({
    validateId,
    submit: project => createProject(project)(dispatch),
    editMode: false,
});

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(ProjectComponent);

export default FormAddContainer;
