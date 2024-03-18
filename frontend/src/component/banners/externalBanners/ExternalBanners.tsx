import { Banner } from 'component/banners/Banner/Banner';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useVariant } from 'hooks/useVariant';
import type { IBanner } from 'interfaces/banner';

export const ExternalBanners = () => {
    const { uiConfig } = useUiConfig();

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

    return (
        <>
            {banners.map((banner) => (
                <Banner key={banner.message} banner={banner} />
            ))}
        </>
    );
};
