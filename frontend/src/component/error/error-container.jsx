import { connect } from 'react-redux';
import ErrorComponent from './error-component';
import { muteError } from '../../store/error-actions';

const mapDispatchToProps = {
    muteError,
};

const mapStateToProps = state => ({
    errors: state.error.get('list').toArray(),
});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorComponent);
