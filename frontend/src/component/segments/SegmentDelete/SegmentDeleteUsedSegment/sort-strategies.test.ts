import { sortStrategiesByFeature } from './sort-strategies.js';

describe('sorting strategies by feature', () => {
    test('strategies with the same id are sorted: existing first, then change requests', () => {
        const strategies = [{ id: 'a', featureName: 'feature1' }];
        const changeRequestStrategies = [
            { id: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
        ];

        const expected = [
            { id: 'a', featureName: 'feature1' },
            { id: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
        ];

        expect(
            sortStrategiesByFeature(strategies, changeRequestStrategies),
        ).toStrictEqual(expected);
    });

    test('the same strategy used in multiple change requests is sorted by change request id', () => {
        const changeRequestStrategies = [
            { id: 'a', featureName: 'feature1', changeRequest: { id: 2 } },
            { id: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
        ];

        const expected = [
            { id: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
            { id: 'a', featureName: 'feature1', changeRequest: { id: 2 } },
        ];

        expect(
            sortStrategiesByFeature([], changeRequestStrategies),
        ).toStrictEqual(expected);
    });

    test('strategies are sorted by id, with change requests strategies being listed before existing strategies if their ids would indicate that', () => {
        const strategies = [{ id: 'b', featureName: 'feature1' }];
        const changeRequestStrategies = [
            { id: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
        ];

        const expected = [
            { id: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
            { id: 'b', featureName: 'feature1' },
        ];

        expect(
            sortStrategiesByFeature(strategies, changeRequestStrategies),
        ).toStrictEqual(expected);
    });

    test('strategies without ids (new strategies) are sorted by change request id', () => {
        const changeRequestStrategies = [
            { featureName: 'feature1', changeRequest: { id: 2 } },
            { featureName: 'feature1', changeRequest: { id: 1 } },
        ];

        const expected = [
            { featureName: 'feature1', changeRequest: { id: 1 } },
            { featureName: 'feature1', changeRequest: { id: 2 } },
        ];

        expect(
            sortStrategiesByFeature([], changeRequestStrategies),
        ).toStrictEqual(expected);
    });

    test('if new strategies have the same change request id, they should be listed in the same order as in the input', () => {
        const changeRequestStrategies = [
            { key: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
            { key: 'b', featureName: 'feature1', changeRequest: { id: 1 } },
        ];

        const expected = [
            { key: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
            { key: 'b', featureName: 'feature1', changeRequest: { id: 1 } },
        ];

        expect(
            sortStrategiesByFeature([], changeRequestStrategies),
        ).toStrictEqual(expected);
    });

    test('all the various sorts work together', () => {
        const strategies = [
            { id: 'a', featureName: 'feature1' },
            { id: 'b', featureName: 'feature1' },
            { id: 'd', featureName: 'feature1' },
        ];
        const changeRequestStrategies = [
            { id: 'a', featureName: 'feature1', changeRequest: { id: 2 } },
            { id: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
            { id: 'c', featureName: 'feature1', changeRequest: { id: 1 } },
            { key: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
            { key: 'b', featureName: 'feature1', changeRequest: { id: 1 } },
        ];

        const expected = [
            { id: 'a', featureName: 'feature1' },
            { id: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
            { id: 'a', featureName: 'feature1', changeRequest: { id: 2 } },
            { id: 'b', featureName: 'feature1' },
            { id: 'c', featureName: 'feature1', changeRequest: { id: 1 } },
            { id: 'd', featureName: 'feature1' },
            { key: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
            { key: 'b', featureName: 'feature1', changeRequest: { id: 1 } },
        ];

        expect(
            sortStrategiesByFeature(strategies, changeRequestStrategies),
        ).toStrictEqual(expected);
    });

    test('when multiple flag names are provided, the list will be sorted on flag name first', () => {
        const strategies = [
            { id: 'b', featureName: 'feature2' },
            { id: 'a', featureName: 'feature1' },
        ];
        const changeRequestStrategies = [
            { id: 'a', featureName: 'feature1', changeRequest: { id: 2 } },
            { id: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
            { id: 'b', featureName: 'feature2', changeRequest: { id: 2 } },
        ];

        const expected = [
            { id: 'a', featureName: 'feature1' },
            { id: 'a', featureName: 'feature1', changeRequest: { id: 1 } },
            { id: 'a', featureName: 'feature1', changeRequest: { id: 2 } },
            { id: 'b', featureName: 'feature2' },
            { id: 'b', featureName: 'feature2', changeRequest: { id: 2 } },
        ];

        expect(
            sortStrategiesByFeature(strategies, changeRequestStrategies),
        ).toStrictEqual(expected);
    });
});
