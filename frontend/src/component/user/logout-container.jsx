import { connect } from 'react-redux';
import LogoutComponent from './logout-component';
import { logoutUser } from '../../store/user/actions';

const mapDispatchToProps = {
    logoutUser,
};

const mapStateToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LogoutComponent);
