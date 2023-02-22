import { SchedulerService } from './scheduler-service';

function ms(timeMs) {
    return new Promise((resolve) => setTimeout(resolve, timeMs));
}

const getLogger = () => {
    const records = [];
    const logger = () => ({
        error(...args: any[]) {
            records.push(args);
        },
        debug() {},
        info() {},
        warn() {},
        fatal() {},
        getRecords() {
            return records;
        },
    });
    logger.getRecords = () => records;

    return logger;
};

test('Schedules job immediately', async () => {
    const schedulerService = new SchedulerService(getLogger());
    const job = jest.fn();

    schedulerService.schedule(job, 10);

    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});

test('Can schedule a single regular job', async () => {
    const schedulerService = new SchedulerService(getLogger());
    const job = jest.fn();

    schedulerService.schedule(job, 10);
    await ms(15);

    expect(job).toBeCalledTimes(2);
    schedulerService.stop();
});

test('Can schedule multiple jobs at the same interval', async () => {
    const schedulerService = new SchedulerService(getLogger());
    const job = jest.fn();
    const anotherJob = jest.fn();

    schedulerService.schedule(job, 10);
    schedulerService.schedule(anotherJob, 10);
    await ms(15);

    expect(job).toBeCalledTimes(2);
    expect(anotherJob).toBeCalledTimes(2);
    schedulerService.stop();
});

test('Can schedule multiple jobs at the different intervals', async () => {
    const schedulerService = new SchedulerService(getLogger());
    const job = jest.fn();
    const anotherJob = jest.fn();

    schedulerService.schedule(job, 100);
    schedulerService.schedule(anotherJob, 200);
    await ms(250);

    expect(job).toBeCalledTimes(3);
    expect(anotherJob).toBeCalledTimes(2);
    schedulerService.stop();
});

test('Can handle crash of a async job', async () => {
    const logger = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = async () => {
        await Promise.reject('async reason');
    };

    schedulerService.schedule(job, 10);
    await ms(15);

    schedulerService.stop();
    expect(logger.getRecords()).toEqual([
        ['scheduled job failed', 'async reason'],
        ['scheduled job failed', 'async reason'],
    ]);
});

test('Can handle crash of a sync job', async () => {
    const logger = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = () => {
        throw new Error('sync reason');
    };

    schedulerService.schedule(job, 10);
    await ms(15);

    schedulerService.stop();
    expect(logger.getRecords()).toEqual([
        ['scheduled job failed', new Error('sync reason')],
        ['scheduled job failed', new Error('sync reason')],
    ]);
});
