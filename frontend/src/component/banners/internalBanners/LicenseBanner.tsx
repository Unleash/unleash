import { Banner } from 'component/banners/Banner/Banner';
import { useLicenseCheck } from 'hooks/api/getters/useLicense/useLicense';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { BannerVariant } from 'interfaces/banner';

export const LicenseBanner = () => {
    const { isEnterprise } = useUiConfig();
    const licenseInfo = useLicenseCheck();

    // Only for enterprise
    if (
        isEnterprise() &&
        licenseInfo &&
        !licenseInfo.loading &&
        !licenseInfo.error
    ) {
        if (!licenseInfo.isValid) {
            const banner = {
                message:
                    licenseInfo.message ||
                    'You have an invalid Unleash license.',
                variant: 'error' as BannerVariant,
                sticky: true,
            };

            return <Banner key={banner.message} banner={banner} />;
        } else {
            if (licenseInfo.message) {
                const banner = {
                    message: licenseInfo.message,
                    variant: mapToVariant(licenseInfo.messageType),
                    sticky: true,
                };
                return <Banner key={banner.message} banner={banner} />;
            }
        }
    }

    return null;
};
function mapToVariant(
    messageType: string | undefined,
): BannerVariant | undefined {
    if (messageType) {
        switch (messageType) {
            case 'warn':
                return 'warning';
            default:
                return messageType as BannerVariant;
        }
    }
}
