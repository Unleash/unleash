import { connect } from 'react-redux';
import UsersList from './UsersList';

const mapStateToProps = state => ({
    location: state.settings.toJS().location || {},
});

const Container = connect(mapStateToProps)(UsersList);

export default Container;
