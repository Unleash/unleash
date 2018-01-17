import { connect } from 'react-redux';
import ShowUserComponent from './show-user-component';
import { fetchUser } from '../../store/user/actions';

const mapDispatchToProps = {
    fetchUser,
};

const mapStateToProps = state => ({
    profile: state.user.get('profile'),
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowUserComponent);
