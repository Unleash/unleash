import { connect } from 'react-redux';
import FlexibleRolloutStrategy from './flexible-rollout-strategy';

const mapStateToProps = state => ({
    context: state.context.toJS(),
});

const FormAddContainer = connect(mapStateToProps, undefined)(FlexibleRolloutStrategy);

export default FormAddContainer;
