import { connect } from 'react-redux';
import AddStrategy from './add-strategy';
import { fetchStrategies } from '../../store/strategy-actions';


export default connect((state) => ({
    strategies: state.strategies.get('list').toArray(),
}), { fetchStrategies })(AddStrategy);
