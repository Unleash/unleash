import { connect } from 'react-redux';
import { fetchProjects, removeProject } from '../../../store/project/actions';
import ProjectList from './ProjectList';

const mapStateToProps = state => {
    const projects = state.projects.toJS();

    return {
        projects,
    };
};

const mapDispatchToProps = dispatch => ({
    removeProject: project => {
        removeProject(project)(dispatch);
    },
    fetchProjects: () => fetchProjects()(dispatch),
});

const ProjectListContainer = connect(mapStateToProps, mapDispatchToProps)(ProjectList);

export default ProjectListContainer;
