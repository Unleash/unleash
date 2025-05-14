import {
    calculateMedians,
    calculateStageDurations,
} from './calculate-stage-durations.js';

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

test('should calculate median durations', () => {
    const groupedData = {
        'Project1/Development': [180, 120, 10],
        'Project1/Testing': [240, 60],
    };
    const medians = calculateMedians(groupedData);
    expect(medians).toMatchObject([
        {
            project: 'Project1',
            stage: 'Development',
            duration: 120,
        },
        {
            project: 'Project1',
            stage: 'Testing',
            duration: 150,
        },
    ]);
});
