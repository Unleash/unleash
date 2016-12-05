import { connect } from 'react-redux';
import ApplicationEdit from './application-edit-component';
import { fetchApplication } from '../../store/application/actions';

const mapStateToProps = (state, props) => {
    let application = state.applications.getIn(['apps', props.appName]);
    if (application) {
        application = application.toJS();
    }
    return {
        application,
    };
};

const Constainer = connect(mapStateToProps, { fetchApplication })(ApplicationEdit);

export default Constainer;
