import { lazy } from 'react';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';

export const LazyLegacyPlayground = lazy(() => import('./Playground'));
export const LazyAdvancedPlayground = lazy(
    () => import('./AdvancedPlayground')
);

export const LazyPlayground = () => {
    const { uiConfig } = useUiConfig();

    if (uiConfig.flags.advancedPlayground) return <LazyAdvancedPlayground />;

    return <LazyLegacyPlayground />;
};
