import { connect } from 'react-redux';
import EventLog from './EventLog';
import { updateSettingForGroup } from '../../../store/settings/actions';

const mapStateToProps = state => {
    const settings = state.settings.toJS().history || {};
    const location = state.settings.toJS().location || {};
    return {
        settings,
        location,
    };
};

const EventLogContainer = connect(mapStateToProps, {
    updateSetting: updateSettingForGroup('history'),
})(EventLog);

export default EventLogContainer;
