import { connect } from 'react-redux';
import SelectStrategies from './select-strategies';
import { fetchStrategies } from '../../store/strategy-actions';


export default connect((state) => ({
    strategies: state.strategies.get('list').toArray(),
}), { fetchStrategies })(SelectStrategies);
