import { connect } from 'react-redux';
import UserProfile from './UserProfile';
import { fetchUser, logoutUser } from '../../../store/user/actions';
import { updateSettingForGroup } from '../../../store/settings/actions';

const mapDispatchToProps = {
    fetchUser,
    logoutUser,
    updateSettingLocation: updateSettingForGroup('location'),
};

const mapStateToProps = state => ({
    profile: state.user.get('profile'),
    location: state.settings ? state.settings.toJS().location : {},
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
