import { connect } from 'react-redux';
import ListComponent from './archive-list-component';
import { fetchArchive, revive } from './../../store/archive-actions';

const mapStateToProps = state => {
    const archive = state.archive.get('list').toArray();

    return {
        archive,
    };
};

const ArchiveListContainer = connect(mapStateToProps, { fetchArchive, revive })(ListComponent);

export default ArchiveListContainer;
