import { connect } from 'react-redux';
import StrategiesSectionComponent from './strategies-section';
import { fetchStrategies } from '../../../store/strategy/actions';

const StrategiesSection = connect(
    (state, ownProps) => ({
        strategies: state.strategies.get('list').toArray(),
        configuredStrategies: ownProps.configuredStrategies,
    }),
    { fetchStrategies }
)(StrategiesSectionComponent);
export default StrategiesSection;
