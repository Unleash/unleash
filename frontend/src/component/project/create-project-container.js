import { connect } from 'react-redux';
import ProjectComponent from './form-project-component';
import { createProject, validateId } from './../../store/project/actions';
import { fetchUser } from './../../store/user/actions';

const mapStateToProps = () => ({
    project: { id: '', name: '', description: '' },
});

const mapDispatchToProps = dispatch => ({
    validateId,
    submit: async project => {
        await createProject(project)(dispatch);
        fetchUser()(dispatch);
    },
    editMode: false,
});

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(ProjectComponent);

export default FormAddContainer;
