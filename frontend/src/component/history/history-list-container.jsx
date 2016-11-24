import { connect } from 'react-redux';
import HistoryListComponent from './history-list-component';
import { updateSettingForGroup } from '../../store/settings/actions';

const mapStateToProps = (state) => {
    let settings = {};
    const historySettings =  state.settings.get('history');
    if (historySettings) {
        settings = historySettings.toJS();
    }

    return {
        settings,
    };
};

const HistoryListContainer = connect(mapStateToProps, {
    updateSetting: updateSettingForGroup('history'),
})(HistoryListComponent);

export default HistoryListContainer;
