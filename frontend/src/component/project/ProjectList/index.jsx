import { connect } from 'react-redux';
import { fetchProjects, removeProject } from '../../../store/project/actions';
import { hasPermission } from '../../../permissions';
import ProjectList from './ProjectList';

const mapStateToProps = state => {
    const projects = state.projects.toJS();

    return {
        projects,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
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
