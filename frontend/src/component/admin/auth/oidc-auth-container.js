import { connect } from 'react-redux';
import OidcAuth from './oidc-auth';
import { getOidcConfig, updateOidcConfig } from '../../../store/e-admin-auth/actions';

const mapStateToProps = state => ({
    config: state.authAdmin.get('oidc'),
    unleashUrl: state.uiConfig.toJS().unleashUrl,
});

const OidcContainer = connect(mapStateToProps, { getOidcConfig, updateOidcConfig })(OidcAuth);

export default OidcContainer;
