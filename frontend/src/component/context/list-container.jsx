import { connect } from 'react-redux';
import ContextFieldListComponent from './list-component.jsx';
import { fetchContext, removeContextField } from './../../store/context/actions';
import { hasPermission } from '../../permissions';

const mapStateToProps = state => {
    const list = state.context.toJS();

    return {
        contextFields: list,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
    };
};

const mapDispatchToProps = dispatch => ({
    removeContextField: contextField => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Are you sure you want to remove this context field?')) {
            removeContextField(contextField)(dispatch);
        }
    },
    fetchContext: () => fetchContext()(dispatch),
});

const ContextFieldListContainer = connect(mapStateToProps, mapDispatchToProps)(ContextFieldListComponent);

export default ContextFieldListContainer;
