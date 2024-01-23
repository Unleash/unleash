import { Banner } from 'component/banners/Banner/Banner';
import { useBanners } from 'hooks/api/getters/useBanners/useBanners';
import { useUiFlag } from '../../../hooks/useUiFlag';
import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender';
import { IBanner } from '../../../interfaces/banner';

export const InternalBanners = () => {
    const { banners } = useBanners();
    const displayUpgradeEdgeBanner = useUiFlag('displayUpgradeEdgeBanner');

    const upgradeEdgeBanner: IBanner = {
        message: `We noticed that you're using an outdated Unleash Edge. To ensure you continue to receive metrics, we recommend upgrading to v17.0.0 or later.`,
        link: 'https://github.com/Unleash/unleash-edge',
        linkText: 'Get latest',
        variant: 'warning',
    };

    return (
        <>
            {banners
                .filter(({ enabled }) => enabled)
                .map((banner) => (
                    <Banner key={banner.id} banner={banner} />
                ))}
            <ConditionallyRender
                condition={displayUpgradeEdgeBanner}
                show={<Banner key={'upgradeEdge'} banner={upgradeEdgeBanner} />}
            />
        </>
    );
};
