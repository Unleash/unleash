import { connect } from 'react-redux';
import ProjectSelectComponent from './project-select-component';
import { fetchProjects } from './../../store/project/actions';
import { P } from '../common/flags';

const mapStateToProps = state => ({
    projects: state.projects.toJS(),
    enabled: !!state.uiConfig.toJS().flags[P],
});

const ProjectContainer = connect(mapStateToProps, { fetchProjects })(ProjectSelectComponent);

export default ProjectContainer;
