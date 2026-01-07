import { baseRoutes, getRoute } from '../routes.ts';

test('returns all baseRoutes', () => {
    expect(baseRoutes).toMatchSnapshot();
});

test('getRoute() returns named route', () => {
    const featuresRoute = getRoute('/search');
    expect(featuresRoute?.path).toEqual('/search');
});
