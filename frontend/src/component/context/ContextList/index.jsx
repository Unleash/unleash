import { connect } from 'react-redux';
import ContextList from './ContextList';
import { fetchContext, removeContextField } from '../../../store/context/actions';
import { hasPermission } from '../../../permissions';

const mapStateToProps = state => {
    const list = state.context.toJS();

    return {
        contextFields: list,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
    };
};

const mapDispatchToProps = dispatch => ({
    removeContextField: contextField => {
        removeContextField(contextField)(dispatch);
    },
    fetchContext: () => fetchContext()(dispatch),
});

const ContextFieldListContainer = connect(mapStateToProps, mapDispatchToProps)(ContextList);

export default ContextFieldListContainer;
