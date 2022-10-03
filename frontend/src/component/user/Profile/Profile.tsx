import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ITab, VerticalTabs } from 'component/common/VerticalTabs/VerticalTabs';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PasswordTab } from './PasswordTab/PasswordTab';
import { PersonalAPITokensTab } from './PersonalAPITokensTab/PersonalAPITokensTab';
import { ProfileTab } from './ProfileTab/ProfileTab';

export const Profile = () => {
    const { user } = useAuthUser();
    const location = useLocation();
    const navigate = useNavigate();

    const { uiConfig } = useUiConfig();

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'password', label: 'Change password', path: 'change-password' },
        {
            id: 'pat',
            label: 'Personal API tokens',
            path: 'personal-api-tokens',
            hidden: !uiConfig.flags.personalAccessTokens,
        },
    ];

    const onChange = (tab: ITab) => {
        navigate(tab.path ? `/profile/${tab.path}` : '/profile', {
            replace: true,
        });
        setTab(tab.id);
    };

    const tabFromUrl = () => {
        const url = location.pathname;
        const foundTab = tabs.find(({ path }) => path && url.includes(path));
        return (foundTab || tabs[0]).id;
    };

    const [tab, setTab] = useState(tabFromUrl());

    useEffect(() => {
        setTab(tabFromUrl());
    }, [location]);

    return (
        <VerticalTabs tabs={tabs} value={tab} onChange={onChange}>
            <ConditionallyRender
                condition={tab === 'profile'}
                show={<ProfileTab user={user!} />}
            />
            <ConditionallyRender
                condition={tab === 'password'}
                show={<PasswordTab />}
            />
            <ConditionallyRender
                condition={tab === 'pat'}
                show={<PersonalAPITokensTab user={user!} />}
            />
        </VerticalTabs>
    );
};
