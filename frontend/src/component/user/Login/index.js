import { connect } from 'react-redux';
import Login from './Login';
import { loadInitialData } from './../../../store/loader';

const mapDispatchToProps = (dispatch, props) => ({
    loadInitialData: () => loadInitialData(props.flags)(dispatch),
});

const mapStateToProps = state => ({
    user: state.user.toJS(),
    flags: state.uiConfig.toJS().flags,
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
