import { connect } from 'react-redux';
import { fetchArchive, revive } from './../../store/archive/actions';
import ViewToggleComponent from '../feature/FeatureView/FeatureView';
import { fetchTags } from '../../store/feature-tags/actions';

export default connect(
    (state, props) => ({
        features: state.archive.get('list').toArray(),
        featureToggle: state.archive
            .get('list')
            .toArray()
            .find(toggle => toggle.name === props.featureToggleName),
        tagTypes: state.tagTypes.toJS(),
        user: state.user.toJS(),
        featureTags: state.featureTags.toJS(),
        activeTab: props.activeTab,
    }),
    {
        fetchArchive,
        revive,
        fetchTags,
    }
)(ViewToggleComponent);
