import { Banner } from 'component/banners/Banner/Banner';
import { useLicenseCheck } from 'hooks/api/getters/useLicense/useLicense';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useVariant } from 'hooks/useVariant';
import { IBanner } from 'interfaces/banner';

export const ExternalBanners = () => {
    const { uiConfig, isEnterprise } = useUiConfig();
    const licenseInfo = useLicenseCheck();

    const bannerVariantFromMessageBannerFlag = useVariant<IBanner | IBanner[]>(
        uiConfig.flags.messageBanner,
    );
    const bannerVariantFromBannerFlag = useVariant<IBanner | IBanner[]>(
        uiConfig.flags.banner,
    );

    const bannerVariant =
        bannerVariantFromMessageBannerFlag || bannerVariantFromBannerFlag || [];

    const banners: IBanner[] = Array.isArray(bannerVariant)
        ? bannerVariant
        : [bannerVariant];
    
     // Only for enterprise
     if(isEnterprise()) {
        if(licenseInfo && !licenseInfo.isValid && !licenseInfo.loading && !licenseInfo.error) {
            banners.push({
                message: licenseInfo.message || 'You have an invalid Unleash license.',
                variant: 'error',
                sticky: true,
            });
        }
    }

    return (
        <>
            {banners.map((banner) => (
                <Banner key={banner.message} banner={banner} />
            ))}
        </>
    );
};
