import { connect } from 'react-redux';
import ApplicationEdit from './application-edit-component';
import { fetchApplication, storeApplicationMetaData, deleteApplication } from './../../store/application/actions';

const mapStateToProps = (state, props) => {
    let application = state.applications.getIn(['apps', props.appName]);
    const location = state.settings.toJS().location || {};
    if (application) {
        application = application.toJS();
    }
    return {
        application,
        location,
    };
};

const Container = connect(mapStateToProps, {
    fetchApplication,
    storeApplicationMetaData,
    deleteApplication,
})(ApplicationEdit);

export default Container;
