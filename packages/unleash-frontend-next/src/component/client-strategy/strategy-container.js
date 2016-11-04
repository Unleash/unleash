import { connect } from 'react-redux';
import ClientStrategies from './strategy-component';
import { fetchClientStrategies } from '../../store/client-strategy-actions';

const mapStateToProps = (state) => ({ clientStrategies: state.clientStrategies.toJS() });

const StrategiesContainer = connect(mapStateToProps, { fetchClientStrategies })(ClientStrategies);

export default StrategiesContainer;
