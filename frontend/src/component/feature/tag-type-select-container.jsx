import { connect } from 'react-redux';
import TagTypeSelectComponent from './tag-type-select-component';
import { fetchTagTypes } from '../../store/tag-type/actions';

const mapStateToProps = state => ({
    types: state.tagTypes.toJS(),
});

const FormAddContainer = connect(mapStateToProps, { fetchTagTypes })(TagTypeSelectComponent);

export default FormAddContainer;
