import { connect } from 'react-redux';
import ApplicationEdit from './application-edit-component';
import { fetchApplication, storeApplicationMetaData } from '../../store/application/actions';

const mapStateToProps = (state, props) => {
    let application = state.applications.getIn(['apps', props.appName]);
    if (application) {
        application = application.toJS();
    }
    return {
        application,
    };
};

const Constainer = connect(mapStateToProps, {
    fetchApplication,
    storeApplicationMetaData,
})(ApplicationEdit);

export default Constainer;
