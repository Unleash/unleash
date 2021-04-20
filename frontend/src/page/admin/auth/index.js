import { connect } from 'react-redux';
import component from './authentication';

const mapStateToProps = state => ({
    authenticationType: state.uiConfig.toJS().authenticationType,
});

const Container = connect(mapStateToProps, { })(component);

export default Container;
