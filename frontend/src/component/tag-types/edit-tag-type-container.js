import { connect } from 'react-redux';
import Component from './form-tag-type-component';
import { updateTagType } from '../../store/tag-type/actions';

const mapStateToProps = (state, props) => {
    const tagTypeBase = { name: '', description: '', icon: '' };
    const realTagType = state.tagTypes.toJS().find(n => n.name === props.tagTypeName);
    const tagType = Object.assign(tagTypeBase, realTagType);

    return {
        tagType,
        editMode: true,
    };
};

const mapDispatchToProps = dispatch => ({
    validateName: () => {},
    submit: tagType => {
        updateTagType(tagType)(dispatch);
    },
});

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(Component);

export default FormAddContainer;
