import { connect } from 'react-redux';
import StrategiesSection from './strategies-section';
import { fetchStrategies } from '../../../store/strategy/actions';


export default connect((state) => ({
    strategies: state.strategies.get('list').toArray(),
}), { fetchStrategies })(StrategiesSection);
