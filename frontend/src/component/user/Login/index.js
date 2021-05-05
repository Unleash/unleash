import { connect } from 'react-redux';
import { fetchUser } from '../../../store/user/actions';
import Login from './Login';

const mapStateToProps = state => ({
    user: state.user.toJS(),
    flags: state.uiConfig.toJS().flags,
});

const mapDispatchToProps = {
    fetchUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
