import { connect } from 'react-redux';
import LogoutComponent from './logout-component';
import { logoutUser } from '../../store/user/actions';

const mapDispatchToProps = {
    logoutUser,
};

const mapStateToProps = (state) => ({
    user: state.user.get('profile'),
});

export default connect(mapStateToProps, mapDispatchToProps)(LogoutComponent);
