import { connect } from 'react-redux';
import UserComponent from './user-component';
import { updateUserName, save } from '../../store/user/actions';


const mapDispatchToProps = {
    updateUserName,
    save,
};

const mapStateToProps = (state) =>  ({
    user: state.user.toJS(),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserComponent);
