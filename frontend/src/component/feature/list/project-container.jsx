import { connect } from 'react-redux';
import Component from './project-component';
import { fetchProjects } from './../../../store/project/actions';

const mapStateToProps = (state, ownProps) => ({
    projects: state.projects.toJS(),
    currentProjectId: ownProps.settings.currentProjectId || '*',
    updateCurrentProject: id => ownProps.updateSetting('currentProjectId', id),
});

export default connect(mapStateToProps, { fetchProjects })(Component);
