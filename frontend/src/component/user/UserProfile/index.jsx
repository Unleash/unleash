import useUser from '../../../hooks/api/getters/useUser/useUser';
import { connect } from 'react-redux';
import UserProfile from './UserProfile';
import { updateSettingForGroup } from '../../../store/settings/actions';

const mapDispatchToProps = {
    updateSettingLocation: updateSettingForGroup('location'),
};

const mapStateToProps = state => ({
    location: state.settings ? state.settings.toJS().location : {},
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(props => {
    const user = useUser();

    return (
        <UserProfile
            location={props.location}
            updateSettingLocation={props.updateSettingLocation}
            profile={user.user}
        />
    );
});
