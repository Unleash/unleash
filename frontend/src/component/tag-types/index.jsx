import { connect } from 'react-redux';
import TagTypesListComponent from './TagTypeList';
import { fetchTagTypes, removeTagType } from '../../store/tag-type/actions';
import { hasPermission } from '../../permissions';

const mapStateToProps = state => {
    const list = state.tagTypes.toJS();
    return {
        tagTypes: list,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
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
