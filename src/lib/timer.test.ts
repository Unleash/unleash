import timer from './timer';

function timeout(fn, ms): Promise<void> {
    return new Promise(resolve =>
        setTimeout(() => {
            fn();
            resolve();
        }, ms),
    );
}

test('should calculate the correct time in seconds', () => {
    expect(timer.seconds([1, 0])).toBe(1);
    expect(timer.seconds([0, 1e6])).toBe(0.001);
    expect(timer.seconds([1, 1e6])).toBe(1.001);
    expect(timer.seconds([1, 552])).toBe(1.000000552);
});

test('timer should track the time', async done => {
    const tt = timer.new();
    let diff;
    await timeout(() => {
        diff = tt();
    }, 20);
    if (diff > 0.019 && diff < 0.05) {
        return;
    }
    return done.fail();
});
