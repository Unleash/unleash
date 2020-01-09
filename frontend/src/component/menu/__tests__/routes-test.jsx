import { routes, baseRoutes, getRoute } from '../routes';

test('returns all defined routes', () => {
    expect(routes.length).toEqual(14);
    expect(routes).toMatchSnapshot();
});

test('returns all baseRoutes', () => {
    expect(baseRoutes.length).toEqual(6);
    expect(baseRoutes).toMatchSnapshot();
});

test('getRoute() returns named route', () => {
    const featuresRoute = getRoute('/features');
    expect(featuresRoute.path).toEqual('/features');
});
