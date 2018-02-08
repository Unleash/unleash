import { connect } from 'react-redux';
import ApplicationEdit from './application-edit-component';
import { fetchApplication, storeApplicationMetaData } from '../../store/application/actions';

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

const Constainer = connect(mapStateToProps, {
    fetchApplication,
    storeApplicationMetaData,
})(ApplicationEdit);

export default Constainer;
