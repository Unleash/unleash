import SchedulerService from './scheduler-service';

function ms(timeMs) {
    return new Promise((resolve) => setTimeout(resolve, timeMs));
}

test('Can schedule a single regular job', async () => {
    const schedulerService = new SchedulerService();
    const job = jest.fn();

    schedulerService.schedule(job, 10);
    await ms(20);

    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});

test('Can schedule multiple jobs at the same interval', async () => {
    const schedulerService = new SchedulerService();
    const job = jest.fn();
    const anotherJob = jest.fn();

    schedulerService.schedule(job, 10);
    schedulerService.schedule(anotherJob, 10);
    await ms(20);

    expect(job).toBeCalledTimes(1);
    expect(anotherJob).toBeCalledTimes(1);
    schedulerService.stop();
});

test('Can schedule multiple jobs at the different intervals', async () => {
    const schedulerService = new SchedulerService();
    const job = jest.fn();
    const anotherJob = jest.fn();

    schedulerService.schedule(job, 10);
    schedulerService.schedule(anotherJob, 20);
    await ms(25);

    expect(job).toBeCalledTimes(2);
    expect(anotherJob).toBeCalledTimes(1);
    schedulerService.stop();
});
