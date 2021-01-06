/* eslint-disable no-console */
import { connect } from 'react-redux';
import arrayMove from 'array-move';

import { requestUpdateFeatureToggleStrategies } from '../../../store/feature-toggle/actions';
import UpdateStrategiesComponent from './update-strategies-component';

const mapStateToProps = (state, ownProps) => ({
    featureToggleName: ownProps.featureToggle.name,
    configuredStrategies: ownProps.featureToggle.strategies,
    strategies: state.strategies.get('list').toArray(),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    addStrategy: s => {
        console.log(`add ${s}`);
        const featureToggle = ownProps.featureToggle;
        const strategies = featureToggle.strategies.concat(s);
        return requestUpdateFeatureToggleStrategies(featureToggle, strategies)(dispatch);
    },

    removeStrategy: index => {
        console.log(`remove ${index}`);
        const featureToggle = ownProps.featureToggle;
        const strategies = featureToggle.strategies.filter((_, i) => i !== index);
        return requestUpdateFeatureToggleStrategies(featureToggle, strategies)(dispatch);
    },

    moveStrategy: (index, toIndex) => {
        // methods.moveItem('strategies', index, toIndex);
        console.log(`move strategy from ${index} to ${toIndex}`);
        console.log(ownProps.featureToggle);
        const featureToggle = ownProps.featureToggle;
        const strategies = arrayMove(featureToggle.strategies, index, toIndex);
        return requestUpdateFeatureToggleStrategies(featureToggle, strategies)(dispatch);
    },

    updateStrategy: (index, s) => {
        // methods.updateInList('strategies', index, n);
        console.log(`update strtegy at index ${index} with ${JSON.stringify(s)}`);
        const featureToggle = ownProps.featureToggle;
        const strategies = featureToggle.strategies.concat();
        strategies[index] = s;
        return requestUpdateFeatureToggleStrategies(featureToggle, strategies)(dispatch);
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(UpdateStrategiesComponent);
