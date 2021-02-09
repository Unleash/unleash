import { connect } from 'react-redux';
import StrategiesList from './strategies-list-add-component';

const mapStateToProps = state => ({
    strategies: state.strategies.get('list').toArray(),
});

export default connect(mapStateToProps, undefined)(StrategiesList);
