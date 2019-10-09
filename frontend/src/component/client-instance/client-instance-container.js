import { connect } from 'react-redux';
import ClientInstances from './client-instance-component';
import { fetchClientInstances } from '../../store/client-instance-actions';

const mapStateToProps = state => ({ clientInstances: state.clientInstances.toJS() });

const StrategiesContainer = connect(
    mapStateToProps,
    { fetchClientInstances }
)(ClientInstances);

export default StrategiesContainer;
