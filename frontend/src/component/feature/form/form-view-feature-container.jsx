import { connect } from 'react-redux';
import { createMapper, createActions } from '../../input-helpers';
import ViewFeatureToggleComponent from './form-view-feature-component';

const ID = 'view-feature-toggle';
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

const prepare = methods => {
    methods.onCancel = evt => {
        evt.preventDefault();
        methods.clear();
        this.props.history.push(`/archive`);
    };
    return methods;
};

const actions = createActions({
    id: getId,
    prepare,
});

export default connect(mapStateToProps, actions)(ViewFeatureToggleComponent);
