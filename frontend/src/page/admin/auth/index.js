import { connect } from 'react-redux';
import component from './authentication';
import { hasPermission } from '../../../permissions';

const mapStateToProps = state => ({
    authenticationType: state.uiConfig.toJS().authenticationType,
    hasPermission: permission => hasPermission(state.user.get('profile'), permission),
});

const Container = connect(mapStateToProps, { })(component);

export default Container;
