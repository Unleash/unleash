import type { IUser } from 'interfaces/user';
import { useUiFlag } from 'hooks/useUiFlag';
import { NewUserProfile } from './NewUserProfile.tsx';
import { LegacyUserProfile } from './LegacyUserProfile.tsx';

interface IUserProfileProps {
    profile: IUser;
}

const UserProfile = ({ profile }: IUserProfileProps) => {
    const userProfileMenuRedesign = useUiFlag('newProfileDropdown');

    if (userProfileMenuRedesign) {
        return <NewUserProfile profile={profile} />;
    }

    return <LegacyUserProfile profile={profile} />;
};

export default UserProfile;
