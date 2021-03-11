import { connect } from 'react-redux';
import Component from './project-component';
import { fetchProjects } from './../../../store/project/actions';
import { P } from '../../common/flags';

const mapStateToProps = (state, ownProps) => ({
    enabled: !!state.uiConfig.toJS().flags[P],
    projects: state.projects.toJS(),
    currentProjectId: ownProps.settings.currentProjectId || '*',
    updateCurrentProject: id => ownProps.updateSetting('currentProjectId', id),
});

export default connect(mapStateToProps, { fetchProjects })(Component);
