import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    type ITab,
    VerticalTabs,
} from 'component/common/VerticalTabs/VerticalTabs';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useAuthSettings from 'hooks/api/getters/useAuthSettings/useAuthSettings';
import { useLocation, useNavigate } from 'react-router';
import { PasswordTab } from './PasswordTab/PasswordTab.tsx';
import { PersonalAPITokensTab } from './PersonalAPITokensTab/PersonalAPITokensTab.tsx';
import { ProfileTab } from './ProfileTab/ProfileTab.tsx';
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
    };

    const visibleTabs = tabs.filter((tab) => !tab.hidden);
    const foundTab = visibleTabs.find(
        ({ path }) => path && location.pathname.includes(path),
    );
    const tab = (foundTab || visibleTabs[0] || tabs[0]).id;

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
