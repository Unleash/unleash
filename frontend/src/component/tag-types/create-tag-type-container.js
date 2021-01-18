import { connect } from 'react-redux';
import TagTypeComponent from './form-tag-type-component';
import { createTagType, validateName } from '../../store/tag-type/actions';

const mapStateToProps = () => ({
    tagType: { name: '', description: '', icon: '' },
    editMode: false,
});

const mapDispatchToProps = dispatch => ({
    validateName: name => validateName(name),
    submit: tagType => createTagType(tagType)(dispatch),
});

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(TagTypeComponent);

export default FormAddContainer;
