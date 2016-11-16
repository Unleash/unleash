import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import { createFeatureToggles, validateName } from '../../store/feature-actions';
import { createMapper, createActions } from '../input-helpers';
import FormComponent from './form';

const ID = 'add-feature-toggle';
const mapStateToProps = createMapper({ id: ID });
const prepare = (methods, dispatch) => {
    methods.onSubmit = (input) => (
        (e) => {
            e.preventDefault();
            createFeatureToggles(input)(dispatch)
                .then(() => methods.clear())
                .then(() => hashHistory.push('/features'));
        }
    );

    methods.onCancel = (evt) => {
        evt.preventDefault();
        hashHistory.push('/features');
    };

    methods.addStrategy = (v) => {
        methods.pushToList('strategies', v);
    };

    methods.updateStrategy = (index, n) => {
        methods.updateInList('strategies', index, n);
    };

    methods.removeStrategy = (index) => {
        methods.removeFromList('strategies', index);
    };

    methods.validateName = (v) => {
        const featureToggleName = v.target.value;
        validateName(featureToggleName)
            .then(()  => methods.setValue('nameError', undefined))
            .catch((err) => methods.setValue('nameError', err.message));
    };

    return methods;
};
const actions = createActions({ id: ID, prepare });

export default connect(mapStateToProps, actions)(FormComponent);
