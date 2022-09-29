import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { VerticalTabs } from 'component/common/VerticalTabs/VerticalTabs';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { useState } from 'react';
import { PasswordTab } from './PasswordTab/PasswordTab';
import { ProfileTab } from './ProfileTab/ProfileTab';

const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Change password' },
];

export const Profile = () => {
    const [tab, setTab] = useState('profile');
    const { user } = useAuthUser();

    return (
        <VerticalTabs tabs={tabs} value={tab} onChange={setTab}>
            <ConditionallyRender
                condition={tab === 'profile'}
                show={<ProfileTab user={user!} />}
            />
            <ConditionallyRender
                condition={tab === 'password'}
                show={<PasswordTab user={user!} />}
            />
        </VerticalTabs>
    );
};
