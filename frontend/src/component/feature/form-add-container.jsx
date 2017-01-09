import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import { createFeatureToggles, validateName } from '../../store/feature-actions';
import { createMapper, createActions } from '../input-helpers';
import FormComponent from './form';

const ID = 'add-feature-toggle';
const mapStateToProps = createMapper({
    id: ID,
    getDefault () {
        let name;
        try {
            [, name] = document.location.hash.match(/name=([a-z0-9-_.]+)/i);
        } catch (e) {}
        return { name };
    },
});
const prepare = (methods, dispatch) => {
    methods.onSubmit = (input) => (
        (e) => {
            e.preventDefault();

            input.strategies.forEach((s) => {
                delete s.id;
            });

            createFeatureToggles(input)(dispatch)
                .then(() => methods.clear())
                .then(() => hashHistory.push(`/features/edit/${input.name}`));
        }
    );

    methods.onCancel = (evt) => {
        evt.preventDefault();
        methods.clear();
        hashHistory.push('/features');
    };

    methods.addStrategy = (v) => {
        v.id = Math.round(Math.random() * 10000000);
        methods.pushToList('strategies', v);
    };

    methods.updateStrategy = (index, n) => {
        methods.updateInList('strategies', index, n);
    };

    methods.moveStrategy = (index, toIndex) => {
        methods.moveItem('strategies', index, toIndex);
    };

    methods.removeStrategy = (index) => {
        methods.removeFromList('strategies', index);
    };

    methods.validateName = (featureToggleName) => {
        validateName(featureToggleName)
            .then(()  => methods.setValue('nameError', undefined))
            .catch((err) => methods.setValue('nameError', err.message));
    };

    return methods;
};
const actions = createActions({ id: ID, prepare });

export default connect(mapStateToProps, actions)(FormComponent);
