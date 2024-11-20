import { useContext } from 'react';
import { Banner } from 'component/banners/Banner/Banner';
import AccessContext from 'contexts/AccessContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import type { BannerVariant } from 'interfaces/banner';

export const SecurityBanner = () => {
    const { uiConfig } = useUiConfig();
    const showUserDeviceCount = useUiFlag('showUserDeviceCount');
    const { isAdmin } = useContext(AccessContext);

    if (
        !isAdmin ||
        !showUserDeviceCount ||
        !uiConfig.maxSessionsCount ||
        uiConfig.maxSessionsCount < 4
    ) {
        return null;
    }

    const banner = {
        message: `Potential security issue: there are ${uiConfig.maxSessionsCount} parallel sessions for a single user account.`,
        variant: 'warning' as BannerVariant,
        sticky: false,
        link: '/admin/users',
        plausibleEvent: 'showUserDeviceCount',
        linkText: 'Review user accounts',
    };

    return <Banner key='showUserDeviceCount' banner={banner} />;
};
