import { connect } from 'react-redux';
import TagsListComponent from './TagList';
import { fetchTags, removeTag } from '../../store/tag/actions';

const mapStateToProps = state => {
    const list = state.tags.toJS();
    return {
        tags: list,
    };
};

const mapDispatchToProps = dispatch => ({
    removeTag: tag => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Are you sure you want to remove this tag?')) {
            removeTag(tag)(dispatch);
        }
    },
    fetchTags: () => fetchTags()(dispatch),
});

const TagsListContainer = connect(mapStateToProps, mapDispatchToProps)(TagsListComponent);

export default TagsListContainer;
