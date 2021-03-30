import { connect } from 'react-redux';
import ProjectSelect from './ProjectSelect';
import { fetchProjects } from '../../../store/project/actions';

const mapStateToProps = (state, ownProps) => ({
    projects: state.projects.toJS(),
    currentProjectId: ownProps.settings.currentProjectId || '*',
    updateCurrentProject: id => ownProps.updateSetting('currentProjectId', id),
});

export default connect(mapStateToProps, { fetchProjects })(ProjectSelect);
