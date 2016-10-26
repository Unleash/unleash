import { connect } from 'react-redux';
import ErrorComponent from './error-component';
import { muteErrors } from '../../store/error-actions';


const mapDispatchToProps = {
    muteErrors,
};

export default connect((state) => ({
    errors: state.error.get('list').toArray(),
    showError: state.error.get('showError'),
}), mapDispatchToProps)(ErrorComponent);
