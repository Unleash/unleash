import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { VerticalTabs } from 'component/common/VerticalTabs/VerticalTabs';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { useState } from 'react';
import { PasswordTab } from './PasswordTab/PasswordTab';
import { ProfileTab } from './ProfileTab/ProfileTab';

const StyledTabPage = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
    },
}));

const StyledTabPageContent = styled('div')(() => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
}));

const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Change password' },
];

export const Profile = () => {
    const [tab, setTab] = useState('profile');
    const { user } = useAuthUser();

    return (
        <StyledTabPage>
            <VerticalTabs tabs={tabs} value={tab} onChange={setTab} />
            <StyledTabPageContent>
                <ConditionallyRender
                    condition={tab === 'profile'}
                    show={<ProfileTab user={user!} />}
                />
                <ConditionallyRender
                    condition={tab === 'password'}
                    show={<PasswordTab user={user!} />}
                />
            </StyledTabPageContent>
        </StyledTabPage>
    );
};
