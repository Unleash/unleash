import { connect } from 'react-redux';
import HistoryListToggleComponent from './history-list-component';
import { updateSettingForGroup } from '../../store/settings/actions';

const mapStateToProps = state => {
    const settings = state.settings.toJS().history || {};
    const location = state.settings.toJS().location || {};
    return {
        settings,
        location,
    };
};

const HistoryListContainer = connect(mapStateToProps, {
    updateSetting: updateSettingForGroup('history'),
})(HistoryListToggleComponent);

export default HistoryListContainer;
