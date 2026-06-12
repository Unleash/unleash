import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { useUiFlag } from 'hooks/useUiFlag';
import { UserProfile } from './UserProfile.tsx';
import { LegacyUserProfile } from './LegacyUserProfile.tsx';

export const UserProfileContainer = () => {
    const { user } = useAuthUser();
    const newProfileDropdown = useUiFlag('newProfileDropdown');

    if (!user) {
        return null;
    }

    return newProfileDropdown ? (
        <UserProfile profile={user} />
    ) : (
        <LegacyUserProfile profile={user} />
    );
};
