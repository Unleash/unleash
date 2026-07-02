import NotFound from 'component/common/NotFound/NotFound';
import { useUiFlag } from 'hooks/useUiFlag';
import { features } from './features';
import { NewInUnleashLayout } from './NewInUnleashLayout';

export const NewInUnleashPage = () => {
    const enabled = useUiFlag('whatsNewPage');

    if (!enabled) {
        return <NotFound />;
    }

    return <NewInUnleashLayout features={features} />;
};
