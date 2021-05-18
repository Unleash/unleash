import { connect } from 'react-redux';
import NewUser from './NewUser';

const mapStateToProps = (state: any) => ({
    user: state.user.toJS(),
});

export default connect(mapStateToProps)(NewUser);
