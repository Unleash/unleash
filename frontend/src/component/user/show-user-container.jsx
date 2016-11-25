import { connect } from 'react-redux';
import ShowUserComponent from './show-user-component';
import { openEdit } from '../../store/user/actions';


const mapDispatchToProps = {
    openEdit,
};

const mapStateToProps = (state) =>  ({
    user: state.user.toJS(),
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowUserComponent);
