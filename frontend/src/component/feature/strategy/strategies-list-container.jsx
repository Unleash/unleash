import { connect } from 'react-redux';
import StrategiesList from './strategies-list-component';

const mapStateToProps = state => ({
    strategies: state.strategies.get('list').toArray(),
    context: state.context.toJS(),
});

export default connect(mapStateToProps, undefined)(StrategiesList);
