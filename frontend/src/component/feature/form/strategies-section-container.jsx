import { connect } from 'react-redux';
import StrategiesSectionComponent from './strategies-section';
import { fetchStrategies } from '../../../store/strategy/actions';

const StrategiesSection = connect(
    state => ({
        strategies: state.strategies.get('list').toArray(),
    }),
    { fetchStrategies }
)(StrategiesSectionComponent);
export default StrategiesSection;
