import { connect } from 'react-redux';

import StrategyConstraintInput from './strategy-constraint-input';
import { C } from '../../../common/flags';

export default connect(
    state => ({
        contextNames: state.context.toJS().map(c => c.name),
        contextFields: state.context.toJS(),
        enabled: !!state.uiConfig.toJS().flags[C],
    }),
    {}
)(StrategyConstraintInput);
