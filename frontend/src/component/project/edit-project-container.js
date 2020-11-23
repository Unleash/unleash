import { connect } from 'react-redux';
import Component from './form-project-component';
import { updateProject, validateId } from './../../store/project/actions';

const mapStateToProps = (state, props) => {
    const projectBase = { id: '', name: '', description: '' };
    const realProject = state.projects.toJS().find(n => n.id === props.projectId);
    const project = Object.assign(projectBase, realProject);

    return {
        project,
    };
};

const mapDispatchToProps = dispatch => ({
    validateId,
    submit: project => updateProject(project)(dispatch),
    editMode: true,
});

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(Component);

export default FormAddContainer;
