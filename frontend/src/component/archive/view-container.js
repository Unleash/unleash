import { connect } from 'react-redux';
import { fetchArchive } from './../../store/archive-actions';

import ViewToggleComponent from './../feature/view-component';

export default connect(
    (state, props) => ({
        features: state.archive.get('list').toArray(),
        featureToggle: state.archive
            .get('list')
            .toArray()
            .find(toggle => toggle.name === props.featureToggleName),
        activeTab: props.activeTab,
    }),
    {
        fetchArchive,
    }
)(ViewToggleComponent);
