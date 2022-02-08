import useUser from '../../../hooks/api/getters/useUser/useUser';
import UserProfile from './UserProfile';
import { useLocationSettings } from '../../../hooks/useLocationSettings';

const UserProfileContainer = () => {
    const user = useUser();
    const { locationSettings, setLocationSettings } = useLocationSettings();

    return (
        <UserProfile
            locationSettings={locationSettings}
            setLocationSettings={setLocationSettings}
            profile={user.user}
        />
    );
};

export default UserProfileContainer;
