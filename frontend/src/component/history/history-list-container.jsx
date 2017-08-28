import { connect } from 'react-redux';
import HistoryListToggleComponent from './history-list-component';
import { updateSettingForGroup } from '../../store/settings/actions';

const mapStateToProps = state => {
    const settings = state.settings.toJS().history || {};

    return {
        settings,
    };
};

const HistoryListContainer = connect(mapStateToProps, {
    updateSetting: updateSettingForGroup('history'),
})(HistoryListToggleComponent);

export default HistoryListContainer;
