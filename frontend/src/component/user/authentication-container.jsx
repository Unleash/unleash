import { connect } from 'react-redux';
import AuthenticationComponent from './authentication-component';
import { unsecureLogin } from '../../store/user/actions';
import { fetchFeatureToggles } from '../../store/feature-actions';

const mapDispatchToProps = {
    unsecureLogin,
    fetchFeatureToggles,
};

const mapStateToProps = state => ({
    user: state.user.toJS(),
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationComponent);
