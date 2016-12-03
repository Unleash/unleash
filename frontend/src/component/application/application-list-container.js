import { connect } from 'react-redux';
import ApplicationList from './application-list-component';
import { fetchApplications } from '../../store/application/actions';

const mapStateToProps = (state) => ({ applications: state.applications.toJS() });

const StrategiesContainer = connect(mapStateToProps, { fetchApplications })(ApplicationList);

export default StrategiesContainer;
