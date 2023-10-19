import { Banner } from 'component/banners/Banner/Banner';
import { useBanners } from 'hooks/api/getters/useBanners/useBanners';

export const InternalBanners = () => {
    const { banners } = useBanners();

    return (
        <>
            {banners.map((banner) => (
                <Banner key={banner.id} banner={banner} />
            ))}
        </>
    );
};
