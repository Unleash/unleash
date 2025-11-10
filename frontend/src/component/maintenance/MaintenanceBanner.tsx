import { Banner } from 'component/banners/Banner/Banner';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PayloadType } from 'utils/variants';

const defaultMessage =
    '**Maintenance mode!** During maintenance mode, any changes made will not be saved and you may receive an error. We apologize for any inconvenience this may cause.';

const useMaintenanceBannerMessage = (): string => {
    const { uiConfig } = useUiConfig();
    const flag = uiConfig.flags.maintenanceMode;
    if (typeof flag === 'boolean') {
        return defaultMessage;
    }

    if (flag?.payload?.type === PayloadType.STRING) {
        return flag.payload.value;
    }
    return defaultMessage;
};

export const MaintenanceBanner = () => {
    const message = useMaintenanceBannerMessage();
    return <Banner banner={{ message, variant: 'error' }} height={65} />;
};
