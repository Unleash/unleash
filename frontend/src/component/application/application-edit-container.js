import { connect } from 'react-redux';
import ApplicationEdit from './application-edit-component';
import { fetchApplication, storeApplicationMetaData, deleteApplication } from './../../store/application/actions';
import { hasPermission } from '../../permissions';

const mapStateToProps = (state, props) => {
    let application = state.applications.getIn(['apps', props.appName]);
    const location = state.settings.toJS().location || {};
    if (application) {
        application = application.toJS();
    }
    return {
        application,
        location,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
    };
};

const Constainer = connect(mapStateToProps, {
    fetchApplication,
    storeApplicationMetaData,
    deleteApplication,
})(ApplicationEdit);

export default Constainer;
