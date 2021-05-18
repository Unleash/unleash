import { connect } from 'react-redux';
import UsersList from './UsersList';

const mapStateToProps = state => {
    return {
        location: state.settings.toJS().location || {},
    };
};

const Container = connect(mapStateToProps)(UsersList);

export default Container;
