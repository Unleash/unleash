import { connect } from 'react-redux';
import GoogleAuth from './google-auth';
import { getGoogleConfig, updateGoogleConfig } from '../../../store/e-admin-auth/actions';

const mapStateToProps = state => ({
    config: state.authAdmin.get('google'),
    unleashUrl: state.uiConfig.toJS().unleashUrl,
});

const Container = connect(mapStateToProps, { getGoogleConfig, updateGoogleConfig })(GoogleAuth);

export default Container;
