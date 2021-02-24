import { connect } from 'react-redux';
import GoogleAuth from './google-auth';
import { getGoogleConfig, updateGoogleConfig } from './../../../store/e-admin-auth/actions';
import { hasPermission } from '../../../permissions';

const mapStateToProps = state => ({
    config: state.authAdmin.get('google'),
    hasPermission: permission => hasPermission(state.user.get('profile'), permission),
});

const Container = connect(mapStateToProps, { getGoogleConfig, updateGoogleConfig })(GoogleAuth);

export default Container;
