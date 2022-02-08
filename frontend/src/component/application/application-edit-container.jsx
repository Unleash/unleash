import { connect } from 'react-redux';
import ApplicationEdit from './application-edit-component';
import {
    deleteApplication,
    fetchApplication,
    storeApplicationMetaData,
} from '../../store/application/actions';
import { useLocationSettings } from '../../hooks/useLocationSettings';

const ApplicationEditContainer = props => {
    const { locationSettings } = useLocationSettings();

    return <ApplicationEdit {...props} locationSettings={locationSettings} />;
};

const mapStateToProps = (state, props) => {
    let application = state.applications.getIn(['apps', props.appName]);
    if (application) {
        application = application.toJS();
    }
    return {
        application,
    };
};

export default connect(mapStateToProps, {
    fetchApplication,
    storeApplicationMetaData,
    deleteApplication,
})(ApplicationEditContainer);
