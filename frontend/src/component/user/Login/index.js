import { connect } from 'react-redux';
import Login from './Login';

const mapStateToProps = state => ({
    user: state.user.toJS(),
    flags: state.uiConfig.toJS().flags,
});

export default connect(mapStateToProps)(Login);
