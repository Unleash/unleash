import { connect } from 'react-redux';
import ProjectSelectComponent from './project-select-component';
import { fetchProjects } from './../../store/project/actions';

const mapStateToProps = state => {
    const projects = state.projects.toJS();

    return {
        projects,
    };
};

const ProjectContainer = connect(mapStateToProps, { fetchProjects })(ProjectSelectComponent);

export default ProjectContainer;
