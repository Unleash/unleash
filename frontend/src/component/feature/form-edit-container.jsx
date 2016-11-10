import { connect } from 'react-redux';
import { hashHistory } from 'react-router';

import { requestUpdateFeatureToggle } from '../../store/feature-actions';
import { createMapper, createActions } from '../input-helpers';
import FormComponent from './form';

const ID = 'edit-feature-toggle';
function getId (props) {
    return [ID, props.featureToggleName];
}
// TODO: need to scope to the active featureToggle
// best is to emulate the "input-storage"?
const mapStateToProps = createMapper({
    id: getId,
    getDefault: (state, ownProps) => {
        if (ownProps.featureToggleName) {
            const match = state.features.findEntry((entry) => entry.get('name') === ownProps.featureToggleName);

            if (match && match[1]) {
                return match[1].toJS();
            }
        }
        return {};
    },
    prepare: (props) => {
        props.editmode = true;
        return props;
    },
});

const prepare =  (methods, dispatch) => {
    methods.onSubmit = (input) => (
        (e) => {
            e.preventDefault();
             // TODO: should add error handling
            requestUpdateFeatureToggle(input)(dispatch)
                .then(() => methods.clear())
                .then(() => window.history.back());
        }
    );

    methods.onCancel = (evt) => {
        evt.preventDefault();
        hashHistory.push('/features');
    };

    methods.addStrategy = (v) => {
        methods.pushToList('strategies', v);
    };

    methods.removeStrategy = (v) => {
        methods.removeFromList('strategies', v);
    };

    methods.updateStrategy = (v, n) => {
        methods.updateInList('strategies', v, n);
    };

    methods.validateName = () => {};

    return methods;
};

const actions = createActions({
    id: getId,
    prepare,
});

export default connect(mapStateToProps, actions)(FormComponent);
