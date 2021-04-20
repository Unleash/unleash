import { connect } from 'react-redux';
import ContextList from './ContextList';
import { fetchContext, removeContextField } from '../../../store/context/actions';

const mapStateToProps = state => {
    const list = state.context.toJS();

    return {
        contextFields: list,
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
