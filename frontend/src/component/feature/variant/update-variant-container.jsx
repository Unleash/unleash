import { connect } from 'react-redux';

import { requestUpdateFeatureToggleVariants } from '../../../store/feature-actions';
import { createMapper, createActions } from '../../input-helpers';
import UpdateFeatureToggleComponent from './update-variant-component';

const ID = 'edit-toggle-variants';
function getId(props) {
    return [ID, props.featureToggle.name];
}
// TODO: need to scope to the active featureToggle
// best is to emulate the "input-storage"?
const mapStateToProps = createMapper({
    id: getId,
    getDefault: (state, ownProps) => ownProps.featureToggle,
    prepare: props => {
        props.editmode = true;
        return props;
    },
});

const prepare = (methods, dispatch, ownProps) => {
    methods.onSubmit = (input, features) => e => {
        e.preventDefault();

        const featureToggle = features.find(f => f.name === input.name);

        // Kind of a hack
        featureToggle.strategies.forEach(s => (s.id = undefined));

        const variants = input.variants.map(v => {
            delete v.edit;
            return v;
        });

        requestUpdateFeatureToggleVariants(featureToggle, variants)(dispatch);
        variants.forEach((v, i) => methods.updateInList('variants', i, v));
    };

    methods.onCancel = evt => {
        evt.preventDefault();
        ownProps.history.push(`/features/view/${ownProps.featureToggle.name}`);
    };

    methods.addVariant = v => {
        methods.pushToList('variants', v);
    };

    methods.removeVariant = index => {
        methods.removeFromList('variants', index);
    };

    methods.updateVariant = (index, n) => {
        methods.updateInList('variants', index, n);
    };

    methods.validateName = () => {};

    return methods;
};

const actions = createActions({
    id: getId,
    prepare,
});

export default connect(
    mapStateToProps,
    actions
)(UpdateFeatureToggleComponent);
