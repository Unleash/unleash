import { connect } from 'react-redux';
import FeatureListComponent from './../feature/list/list-component';
import { fetchArchive, revive } from './../../store/archive/actions';
import { updateSettingForGroup } from './../../store/settings/actions';
import { mapStateToPropsConfigurable } from '../feature/list/list-container';

const mapStateToProps = mapStateToPropsConfigurable(false);
const mapDispatchToProps = {
    fetchArchive,
    revive,
    updateSetting: updateSettingForGroup('feature'),
};

const ArchiveListContainer = connect(mapStateToProps, mapDispatchToProps)(FeatureListComponent);

export default ArchiveListContainer;
