import { useUiFlag } from 'hooks/useUiFlag';
import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender';
import { Banner } from '../Banner/Banner';
import type { IBanner } from '../../../interfaces/banner';

export const EdgeUpgradeBanner = () => {
    const displayUpgradeEdgeBanner = useUiFlag('displayUpgradeEdgeBanner');
    const upgradeEdgeBanner: IBanner = {
        message: `We noticed that an outdated Edge version is connected to this Unleash instance. To ensure you continue to receive metrics, we recommend upgrading to v17.0.0 or later.`,
        link: 'https://github.com/Unleash/unleash-edge',
        linkText: 'Get latest',
        variant: 'warning',
    };
    return (
        <>
            <ConditionallyRender
                condition={displayUpgradeEdgeBanner}
                show={<Banner key={'upgradeEdge'} banner={upgradeEdgeBanner} />}
            />
        </>
    );
};
