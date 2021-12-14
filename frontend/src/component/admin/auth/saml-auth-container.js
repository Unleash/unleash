import { connect } from 'react-redux';
import SamlAuth from './saml-auth';
import { getSamlConfig, updateSamlConfig } from '../../../store/e-admin-auth/actions';

const mapStateToProps = state => ({
    config: state.authAdmin.get('saml'),
    unleashUrl: state.uiConfig.toJS().unleashUrl,
});

const Container = connect(mapStateToProps, { getSamlConfig, updateSamlConfig })(SamlAuth);

export default Container;
