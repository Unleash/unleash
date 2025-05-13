import UserProfile from './UserProfile.tsx';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

const UserProfileContainer = () => {
    const { user } = useAuthUser();

    if (!user) {
        return null;
    }

    return <UserProfile profile={user} />;
};

export default UserProfileContainer;
