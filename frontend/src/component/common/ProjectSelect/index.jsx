import { connect } from 'react-redux';
import ProjectSelect from './ProjectSelect';
import { fetchProjects } from '../../../store/project/actions';

const mapStateToProps = (state, ownProps) => ({
    ...ownProps,
    projects: state.projects.toJS(),
});

export default connect(mapStateToProps, { fetchProjects })(ProjectSelect);
