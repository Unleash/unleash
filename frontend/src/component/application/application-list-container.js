import { connect } from 'react-redux';
import ApplicationList from './application-list-component';
import { fetchAll } from './../../store/application/actions';
import { updateSettingForGroup } from '../../store/settings/actions';

const mapStateToProps = state => {
    const applications = state.applications.get('list').toJS();
    const settings = state.settings.toJS().application || {};

    const regex = new RegExp(settings.filter, 'i');

    return {
        applications: settings.filter ? applications.filter(a => regex.test(a.appName)) : applications,
        settings,
    };
};
const mapDispatchToProps = { fetchAll, updateSetting: updateSettingForGroup('application') };

const Container = connect(mapStateToProps, mapDispatchToProps)(ApplicationList);

export default Container;
