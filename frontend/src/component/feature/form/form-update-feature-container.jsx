import { connect } from 'react-redux';
import { hashHistory } from 'react-router';

import { requestUpdateFeatureToggle } from '../../../store/feature-actions';
import { createMapper, createActions } from '../../input-helpers';
import UpdateFeatureToggleComponent from './form-update-feature-component';

const ID = 'edit-feature-toggle';
function getId(props) {
    return [ID, props.featureToggle.name];
}
// TODO: need to scope to the active featureToggle
// best is to emulate the "input-storage"?
const mapStateToProps = createMapper({
    id: getId,
    getDefault: (state, ownProps) => {
        ownProps.featureToggle.strategies.forEach((strategy, index) => {
            strategy.id = Math.round(Math.random() * 1000000 * (1 + index));
        });
        return ownProps.featureToggle;
    },
    prepare: props => {
        props.editmode = true;
        return props;
    },
});

const prepare = (methods, dispatch) => {
    methods.onSubmit = (input, features) => e => {
        e.preventDefault();

        if (Array.isArray(input.strategies)) {
            input.strategies.forEach(s => {
                delete s.id;
            });
        }
        delete input.description;
        // take the status of the feature toggles from the central store in case `toggleFeature` function was called
        const feat = features.find(f => f.name === input.name);
        input.enabled = feat.enabled;

        // TODO: should add error handling
        requestUpdateFeatureToggle(input)(dispatch)
            .then(() => methods.clear())
            .then(() => hashHistory.push(`/features`));
    };

    methods.onCancel = evt => {
        evt.preventDefault();
        methods.clear();
        hashHistory.push(`/features`);
    };

    methods.addStrategy = v => {
        v.id = Math.round(Math.random() * 10000000);
        methods.pushToList('strategies', v);
    };

    methods.removeStrategy = index => {
        methods.removeFromList('strategies', index);
    };

    methods.moveStrategy = (index, toIndex) => {
        methods.moveItem('strategies', index, toIndex);
    };

    methods.updateStrategy = (index, n) => {
        methods.updateInList('strategies', index, n);
    };

    methods.validateName = () => {};

    return methods;
};

const actions = createActions({
    id: getId,
    prepare,
});

export default connect(mapStateToProps, actions)(UpdateFeatureToggleComponent);
