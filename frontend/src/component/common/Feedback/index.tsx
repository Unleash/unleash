import { Dispatch } from 'react';
import { connect } from 'react-redux';
import { Action } from 'redux';
import { hideFeedback } from '../../../store/feedback/actions';
import { fetchUser } from '../../../store/user/actions';
import Feedback from './Feedback';

const mapStateToProps = (state: any) => ({
    show: state.feedback.show,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    hideFeedback: () => {
        hideFeedback(dispatch)();
    },
    fetchUser: () => fetchUser()(dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
