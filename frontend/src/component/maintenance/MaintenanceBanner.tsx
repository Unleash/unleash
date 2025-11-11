import { Banner } from 'component/banners/Banner/Banner';
import { useMaintenanceBannerMessage } from './useMaintenanceBannerMessage.ts';

export const MaintenanceBanner = () => {
    const message = useMaintenanceBannerMessage();
    return <Banner banner={{ message, variant: 'error' }} />;
};
