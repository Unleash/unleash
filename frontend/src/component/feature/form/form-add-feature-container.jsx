import { connect } from 'react-redux';
import { createFeatureToggles, validateName } from './../../../store/feature-actions';
import { createMapper, createActions } from './../../input-helpers';
import AddFeatureComponent from './form-add-feature-component';

const ID = 'add-feature-toggle';
const mapStateToProps = createMapper({
    id: ID,
    getDefault() {
        let name;
        try {
            [, name] = document.location.hash.match(/name=([a-z0-9-_.]+)/i);
        } catch (e) {
            // hide error
        }
        return { name };
    },
});
const prepare = (methods, dispatch) => {
    methods.onSubmit = input => e => {
        e.preventDefault();

        input.createdAt = new Date();

        if (Array.isArray(input.strategies)) {
            input.strategies.forEach(s => {
                delete s.id;
            });
        }

        createFeatureToggles(input)(dispatch)
            .then(() => methods.clear())
            .then(() => this.props.history.push(`/features/strategies/${input.name}`));
    };

    methods.onCancel = evt => {
        evt.preventDefault();
        methods.clear();
        this.props.history.push('/features');
    };

    methods.addStrategy = v => {
        v.id = Math.round(Math.random() * 10000000);
        methods.pushToList('strategies', v);
    };

    methods.updateStrategy = (index, n) => {
        methods.updateInList('strategies', index, n);
    };

    methods.moveStrategy = (index, toIndex) => {
        methods.moveItem('strategies', index, toIndex);
    };

    methods.removeStrategy = index => {
        methods.removeFromList('strategies', index);
    };

    methods.validateName = featureToggleName => {
        validateName(featureToggleName)
            .then(() => methods.setValue('nameError', undefined))
            .catch(err => methods.setValue('nameError', err.message));
    };

    return methods;
};
const actions = createActions({ id: ID, prepare });

const FormAddContainer = connect(mapStateToProps, actions)(AddFeatureComponent);

export default FormAddContainer;
