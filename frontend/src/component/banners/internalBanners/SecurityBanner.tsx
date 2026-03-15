import { useContext } from 'react';
import { Banner } from 'component/banners/Banner/Banner';
import AccessContext from 'contexts/AccessContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import type { BannerVariant } from 'interfaces/banner';

export const SecurityBanner = () => {
    const { uiConfig } = useUiConfig();
    const showUserDeviceCount = useUiFlag('showUserDeviceCount');
    const sessionInspector = useUiFlag('sessionInspector');
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
        ...(sessionInspector && {
            link: '/admin/sessions',
            linkText: 'Inspect sessions',
        }),
        plausibleEvent: 'showUserDeviceCount',
    };

    return <Banner key='showUserDeviceCount' banner={banner} />;
};
