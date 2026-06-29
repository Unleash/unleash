import { expect, test } from 'vitest';
import { baseRoutes, getRoute } from '../routes.ts';

test('returns all baseRoutes', () => {
    // Omit the component field to avoid snapshotting React lazy internals
    // (_debugInfo, _ioInfo, etc.) that churn on React patch upgrades.
    const stableRoutes = baseRoutes.map(
        ({ component: _component, ...rest }) => rest,
    );
    expect(stableRoutes).toMatchSnapshot();
});

test('getRoute() returns named route', () => {
    const featuresRoute = getRoute('/search');
    expect(featuresRoute?.path).toEqual('/search');
});
