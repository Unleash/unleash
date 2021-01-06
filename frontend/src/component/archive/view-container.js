import { connect } from 'react-redux';
import { fetchArchive, revive } from './../../store/archive/actions';
import ViewToggleComponent from './../feature/view/view-component';
import { hasPermission } from '../../permissions';

export default connect(
    (state, props) => ({
        features: state.archive.get('list').toArray(),
        featureToggle: state.archive
            .get('list')
            .toArray()
            .find(toggle => toggle.name === props.featureToggleName),
        activeTab: props.activeTab,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
    }),
    {
        fetchArchive,
        revive,
    }
)(ViewToggleComponent);
