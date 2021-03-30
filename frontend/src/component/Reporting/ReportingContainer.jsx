import { connect } from 'react-redux';
import { fetchFeatureToggles } from '../../store/feature-toggle/actions';

import Reporting from './Reporting.jsx';

const mapStateToProps = state => ({
    projects: state.projects.toJS(),
});

const mapDispatchToProps = {
    fetchFeatureToggles,
};

const ReportingContainer = connect(mapStateToProps, mapDispatchToProps)(Reporting);

export default ReportingContainer;
