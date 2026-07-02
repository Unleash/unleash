import NotFound from 'component/common/NotFound/NotFound';
import { useUiFlag } from 'hooks/useUiFlag';
import { features } from './features';
import { WhatsNewLayout } from './WhatsNewLayout';

export const WhatsNewPage = () => {
    const enabled = useUiFlag('whatsNewPage');

    if (!enabled) {
        return <NotFound />;
    }

    return <WhatsNewLayout features={features} />;
};
