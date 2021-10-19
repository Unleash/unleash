import { connect } from 'react-redux';
import AuthenticationComponent from './Authentication';
import {
    insecureLogin,
    passwordLogin,
    demoLogin,
} from '../../../store/user/actions';

const mapDispatchToProps = (dispatch, props) => ({
    demoLogin: (path, user) => demoLogin(path, user)(dispatch),
    insecureLogin: (path, user) => insecureLogin(path, user)(dispatch),
    passwordLogin: (path, user) => passwordLogin(path, user)(dispatch),
});

export default connect(null, mapDispatchToProps)(AuthenticationComponent);
