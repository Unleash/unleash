import { SeriesLruCache } from './series-lru-cache.js';

test('evicts nothing while there are no more series than the limit', () => {
    const seriesLruCache = new SeriesLruCache(2);

    const evictedByFirstSeries = seriesLruCache.touch('page_views', {
        appName: 'web',
    });
    const evictedBySecondSeries = seriesLruCache.touch('page_views', {
        appName: 'ios',
    });

    expect(evictedByFirstSeries).toBeUndefined();
    expect(evictedBySecondSeries).toBeUndefined();
});

test('a series that is written again is no longer the one written longest ago', () => {
    const seriesLruCache = new SeriesLruCache(2);
    seriesLruCache.touch('page_views', { appName: 'web' });
    seriesLruCache.touch('page_views', { appName: 'ios' });
    seriesLruCache.touch('page_views', { appName: 'web' });

    const evicted = seriesLruCache.touch('page_views', { appName: 'android' });

    expect(evicted).toEqual({
        type: 'series',
        name: 'page_views',
        labels: { appName: 'ios' },
    });
});

test('the same labels in another order are the same series', () => {
    const seriesLruCache = new SeriesLruCache(1);
    seriesLruCache.touch('page_views', {
        appName: 'web',
        environment: 'production',
    });

    const evicted = seriesLruCache.touch('page_views', {
        environment: 'production',
        appName: 'web',
    });

    expect(evicted).toBeUndefined();
});

test('evicts a series while its metric has others, and the whole metric with its last series', () => {
    const seriesLruCache = new SeriesLruCache(2);
    seriesLruCache.touch('checkout_errors', { appName: 'web' });
    seriesLruCache.touch('page_views', { appName: 'web' });

    const evictedFirst = seriesLruCache.touch('page_views', { appName: 'ios' });
    const evictedNext = seriesLruCache.touch('page_views', {
        appName: 'android',
    });

    expect(evictedFirst).toEqual({ type: 'metric', name: 'checkout_errors' });
    expect(evictedNext).toEqual({
        type: 'series',
        name: 'page_views',
        labels: { appName: 'web' },
    });
});

test('a label value written as a number and as text is the same series', () => {
    const seriesLruCache = new SeriesLruCache(1);
    seriesLruCache.touch('page_views', { status: 200 });

    const evicted = seriesLruCache.touch('page_views', { status: '200' });

    expect(evicted).toBeUndefined();
});

test('a deleted metric starts over when it is written again', () => {
    const seriesLruCache = new SeriesLruCache(1);
    seriesLruCache.touch('page_views', { appName: 'web' });
    seriesLruCache.deleteMetric('page_views');

    const evictedByWritingItAgain = seriesLruCache.touch('page_views', {
        appName: 'ios',
    });
    const evictedByAnotherMetric = seriesLruCache.touch('checkout_errors', {
        appName: 'web',
    });

    expect(evictedByWritingItAgain).toBeUndefined();
    expect(evictedByAnotherMetric).toEqual({
        type: 'metric',
        name: 'page_views',
    });
});

test('the metric being written is never evicted as a whole', () => {
    const seriesLruCache = new SeriesLruCache(1);
    seriesLruCache.touch('page_views', { appName: 'web' });

    const evicted = seriesLruCache.touch('page_views', { appName: 'ios' });

    expect(evicted).toEqual({
        type: 'series',
        name: 'page_views',
        labels: { appName: 'web' },
    });
});

test('writing a series that is already there evicts nothing, also right after an eviction', () => {
    const seriesLruCache = new SeriesLruCache(1);
    seriesLruCache.touch('page_views', { appName: 'web' });
    seriesLruCache.touch('page_views', { appName: 'ios' });

    const evicted = seriesLruCache.touch('page_views', { appName: 'ios' });

    expect(evicted).toBeUndefined();
});
