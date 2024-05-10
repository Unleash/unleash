import { calculateStageDurations } from './calculate-stage-durations';

test('can find feature lifecycle stage timings', async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const durations = calculateStageDurations([
        {
            feature: 'a',
            stage: 'initial',
            project: 'default',
            enteredStageAt: oneHourAgo,
        },
        {
            feature: 'b',
            stage: 'initial',
            project: 'default',
            enteredStageAt: oneHourAgo,
        },
        {
            feature: 'a',
            stage: 'pre-live',
            project: 'default',
            enteredStageAt: twentyMinutesAgo,
        },
        {
            feature: 'b',
            stage: 'live',
            project: 'default',
            enteredStageAt: tenMinutesAgo,
        },
        {
            feature: 'c',
            stage: 'initial',
            project: 'default',
            enteredStageAt: oneHourAgo,
        },
        {
            feature: 'c',
            stage: 'pre-live',
            project: 'default',
            enteredStageAt: fiveMinutesAgo,
        },
    ]);

    expect(durations).toMatchObject([
        {
            project: 'default',
            stage: 'initial',
            duration: 50,
        },
        {
            project: 'default',
            stage: 'pre-live',
            duration: 12.5,
        },
        {
            project: 'default',
            stage: 'live',
            duration: 10,
        },
    ]);
});
