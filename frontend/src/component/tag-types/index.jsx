import { connect } from 'react-redux';
import TagTypesListComponent from './TagTypeList';
import { fetchTagTypes, removeTagType } from '../../store/tag-type/actions';

const mapStateToProps = state => {
    const list = state.tagTypes.toJS();
    return {
        tagTypes: list,
    };
};

const mapDispatchToProps = dispatch => ({
    removeTagType: tagtype => {
        removeTagType(tagtype)(dispatch);
    },
    fetchTagTypes: () => fetchTagTypes()(dispatch),
});

const TagTypesListContainer = connect(mapStateToProps, mapDispatchToProps)(TagTypesListComponent);

export default TagTypesListContainer;
