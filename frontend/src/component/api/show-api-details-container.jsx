import { connect } from 'react-redux';
import ShowApiDetailsComponent from './show-api-details-component';

const mapDispatchToProps = {};

const mapStateToProps = state => ({
    uiConfig: state.uiConfig.toJS(),
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowApiDetailsComponent);
