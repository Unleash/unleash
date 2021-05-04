import { connect } from 'react-redux';
import StrategyCardConstraints from './StrategyCardConstraints';

const mapStateToProps = (state, ownProps) => ({
    flags: state.uiConfig.toJS().flags,
    constraints: ownProps.constraints,
});

export default connect(mapStateToProps)(StrategyCardConstraints);
