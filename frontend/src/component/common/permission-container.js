import { connect } from 'react-redux';
import PermissionComponent from './permission-component';

const mapStateToProps = state => ({ user: state.user.get('profile') });

const Container = connect(mapStateToProps)(PermissionComponent);

export default Container;
