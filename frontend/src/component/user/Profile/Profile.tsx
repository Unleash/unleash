import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ITab, VerticalTabs } from 'component/common/VerticalTabs/VerticalTabs';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useAuthSettings from 'hooks/api/getters/useAuthSettings/useAuthSettings';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PasswordTab } from './PasswordTab/PasswordTab';
import { PersonalAPITokensTab } from './PersonalAPITokensTab/PersonalAPITokensTab';
import { ProfileTab } from './ProfileTab/ProfileTab';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const Profile = () => {
    const { user } = useAuthUser();
    const location = useLocation();
    const navigate = useNavigate();
    const { config: simpleAuthConfig, loading } = useAuthSettings('simple');

    const { uiConfig } = useUiConfig();

    const tabs = [
        { id: 'profile', label: 'Profile' },
        {
            id: 'password',
            label: 'Change password',
            path: 'change-password',
            hidden: simpleAuthConfig.disabled,
        },
        {
            id: 'pat',
            label: 'Personal API tokens',
            path: 'personal-api-tokens',
            hidden: uiConfig.flags.personalAccessTokensKillSwitch,
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

    if (loading) return null;

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
                show={<PersonalAPITokensTab />}
            />
        </VerticalTabs>
    );
};
