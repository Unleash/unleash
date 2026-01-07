import { useUiFlag } from 'hooks/useUiFlag';
import { useVariant } from 'hooks/useVariant';
import { PayloadType, type Variant } from 'utils/variants';

export const defaultMessage =
    '**Maintenance mode!** During maintenance mode, any changes made will not be saved and you may receive an error. We apologize for any inconvenience this may cause.';

export const useMaintenanceBannerMessage = (): string => {
    const flag = useUiFlag('maintenanceMode');
    const variantValue = useVariant(flag as Variant);
    if (typeof flag === 'boolean') {
        return defaultMessage;
    }

    if (flag?.payload?.type === PayloadType.STRING) {
        return variantValue || defaultMessage;
    }
    return defaultMessage;
};
