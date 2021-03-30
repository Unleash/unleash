import {
    sortFeaturesByNameAscending,
    sortFeaturesByNameDescending,
    sortFeaturesByLastSeenAscending,
    sortFeaturesByLastSeenDescending,
    sortFeaturesByCreatedAtAscending,
    sortFeaturesByCreatedAtDescending,
    sortFeaturesByExpiredAtAscending,
    sortFeaturesByExpiredAtDescending,
    sortFeaturesByStatusAscending,
    sortFeaturesByStatusDescending,
} from '../utils';

const getTestData = () => [
    {
        name: 'abe',
        createdAt: '2021-02-14T02:42:34.515Z',
        lastSeenAt: '2021-02-21T19:34:21.830Z',
        type: 'release',
        stale: false,
    },
    {
        name: 'bet',
        createdAt: '2021-02-13T02:42:34.515Z',
        lastSeenAt: '2021-02-19T19:34:21.830Z',
        type: 'release',
        stale: false,
    },
    {
        name: 'cat',
        createdAt: '2021-02-12T02:42:34.515Z',
        lastSeenAt: '2021-02-18T19:34:21.830Z',
        type: 'experiment',
        stale: true,
    },
];

test('it sorts features by name ascending', () => {
    const testData = getTestData();

    const result = sortFeaturesByNameAscending(testData);

    expect(result[0].name).toBe('abe');
    expect(result[2].name).toBe('cat');
});

test('it sorts features by name descending', () => {
    const testData = getTestData();

    const result = sortFeaturesByNameDescending(testData);

    expect(result[0].name).toBe('cat');
    expect(result[2].name).toBe('abe');
});

test('it sorts features by lastSeenAt ascending', () => {
    const testData = getTestData();

    const result = sortFeaturesByLastSeenAscending(testData);

    expect(result[0].name).toBe('cat');
    expect(result[2].name).toBe('abe');
});

test('it sorts features by lastSeenAt descending', () => {
    const testData = getTestData();

    const result = sortFeaturesByLastSeenDescending(testData);

    expect(result[0].name).toBe('abe');
    expect(result[2].name).toBe('cat');
});

test('it sorts features by createdAt ascending', () => {
    const testData = getTestData();

    const result = sortFeaturesByCreatedAtAscending(testData);

    expect(result[0].name).toBe('cat');
    expect(result[2].name).toBe('abe');
});

test('it sorts features by createdAt descending', () => {
    const testData = getTestData();

    const result = sortFeaturesByCreatedAtDescending(testData);

    expect(result[0].name).toBe('abe');
    expect(result[2].name).toBe('cat');
});

test('it sorts features by expired ascending', () => {
    const testData = getTestData();

    const result = sortFeaturesByExpiredAtAscending(testData);

    expect(result[0].name).toBe('cat');
    expect(result[2].name).toBe('abe');
});

test('it sorts features by expired descending', () => {
    const testData = getTestData();

    const result = sortFeaturesByExpiredAtDescending(testData);

    expect(result[0].name).toBe('abe');
    expect(result[2].name).toBe('cat');
});

test('it sorts features by status ascending', () => {
    const testData = getTestData();

    const result = sortFeaturesByStatusAscending(testData);

    expect(result[0].name).toBe('abe');
    expect(result[2].name).toBe('cat');
});

test('it sorts features by status descending', () => {
    const testData = getTestData();

    const result = sortFeaturesByStatusDescending(testData);

    expect(result[0].name).toBe('cat');
    expect(result[2].name).toBe('abe');
});
