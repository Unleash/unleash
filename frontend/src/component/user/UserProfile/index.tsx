import UserProfile from './UserProfile';
import { useLocationSettings } from '../../../hooks/useLocationSettings';
import { useAuthUser } from '../../../hooks/api/getters/useAuth/useAuthUser';

const UserProfileContainer = () => {
    const { locationSettings, setLocationSettings } = useLocationSettings();
    const { user } = useAuthUser();

    if (!user) {
        return null;
    }

    return (
        <UserProfile
            locationSettings={locationSettings}
            setLocationSettings={setLocationSettings}
            profile={user}
        />
    );
};

export default UserProfileContainer;
