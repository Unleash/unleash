import { connect } from 'react-redux';
import { hashHistory } from 'react-router';


import { createFeatureToggles } from '../../store/feature-actions';
import AddComponent from './add-component';
import { createMapper, createActions } from '../input-helpers';

const ID = 'add-feature-toggle';
const mapStateToProps = createMapper({ id: ID });
const prepare = (methods, dispatch) => {
    methods.onSubmit = (input) => (
        (e) => {
            e.preventDefault();
            // TODO: should add error handling
            createFeatureToggles(input)(dispatch)
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

    methods.updateStrategy = (v, n) => {
        methods.updateInList('strategies', v, n);
    };

    methods.removeStrategy = (v) => {
        methods.removeFromList('strategies', v);
    };

    return methods;
};
const actions = createActions({ id: ID, prepare });

export default connect(mapStateToProps, actions)(AddComponent);
