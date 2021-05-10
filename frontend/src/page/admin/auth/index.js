import { connect } from 'react-redux';
import component from './authentication';
import { OIDC } from '../../../component/common/flags';

const mapStateToProps = state => ({
    authenticationType: state.uiConfig.toJS().authenticationType,
    enableOIDC: !!state.uiConfig.toJS().flags[OIDC],
});

const Container = connect(mapStateToProps, { })(component);

export default Container;
