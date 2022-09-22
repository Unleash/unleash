import RequestCounter from './request-counter';

test('Request counter can keep track of seen app names', async () => {
    jest.useFakeTimers();
    const counter = new RequestCounter();
    counter.recordRequest('app1');
    counter.recordRequest('app1');
    counter.recordRequest('app1');
    counter.recordRequest('app1');
    counter.recordRequest('app1');
    counter.recordRequest('app1');
    counter.recordRequest('app2');
    counter.recordRequest('app2');
    jest.advanceTimersByTime(400000);

    const buckets = counter.getBuckets();

    expect(buckets).toHaveLength(1);

    expect(buckets[0].apps['app1'].count).toBe(6);
    expect(buckets[0].apps['app2'].count).toBe(2);
});
