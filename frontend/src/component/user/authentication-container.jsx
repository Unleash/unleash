import { connect } from 'react-redux';
import AuthenticationComponent from './authentication-component';
import { unsecureLogin, passwordLogin } from '../../store/user/actions';
import { fetchFeatureToggles } from '../../store/feature-actions';
import { fetchUIConfig } from '../../store/ui-config/actions';

const mapDispatchToProps = {
    unsecureLogin,
    passwordLogin,
    fetchFeatureToggles,
    fetchUIConfig,
};

const mapStateToProps = state => ({
    user: state.user.toJS(),
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationComponent);
