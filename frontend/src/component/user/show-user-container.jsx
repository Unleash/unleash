import { connect } from 'react-redux';
import ShowUserComponent from './show-user-component';
import { fetchUser } from '../../store/user/actions';
import { updateSettingForGroup } from '../../store/settings/actions';

const mapDispatchToProps = {
    fetchUser,
    updateSettingLocation: updateSettingForGroup('location'),
};

const mapStateToProps = state => ({
    profile: state.user.get('profile'),
    location: state.settings ? state.settings.toJS().location : {},
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowUserComponent);
