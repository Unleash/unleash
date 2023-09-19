import { SchedulerService } from './scheduler-service';
import { LogProvider } from '../logger';

function ms(timeMs) {
    return new Promise((resolve) => setTimeout(resolve, timeMs));
}

const getLogger = () => {
    const records: any[] = [];
    const logger: LogProvider = () => ({
        error(...args: any[]) {
            records.push(args);
        },
        debug() {},
        info() {},
        warn() {},
        fatal() {},
    });
    const getRecords = () => records;

    return { logger, getRecords };
};

test('Schedules job immediately', async () => {
    const { logger } = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = jest.fn();

    schedulerService.schedule(job, 10, 'test-id');

    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});

test('Does not schedule job immediately when paused', async () => {
    const { logger } = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = jest.fn();

    schedulerService.pause();
    schedulerService.schedule(job, 10, 'test-id-2');

    expect(job).toBeCalledTimes(0);
    schedulerService.stop();
});

test('Can schedule a single regular job', async () => {
    const { logger } = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = jest.fn();

    schedulerService.schedule(job, 50, 'test-id-3');
    await ms(75);

    expect(job).toBeCalledTimes(2);
    schedulerService.stop();
});

test('Scheduled job ignored in a paused mode', async () => {
    const { logger } = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = jest.fn();

    schedulerService.pause();
    schedulerService.schedule(job, 50, 'test-id-4');
    await ms(75);

    expect(job).toBeCalledTimes(0);
    schedulerService.stop();
});

test('Can resume paused job', async () => {
    const { logger } = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = jest.fn();

    schedulerService.pause();
    schedulerService.schedule(job, 50, 'test-id-5');
    schedulerService.resume();
    await ms(75);

    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});

test('Can schedule multiple jobs at the same interval', async () => {
    const { logger } = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = jest.fn();
    const anotherJob = jest.fn();

    schedulerService.schedule(job, 50, 'test-id-6');
    schedulerService.schedule(anotherJob, 50, 'test-id-7');
    await ms(75);

    expect(job).toBeCalledTimes(2);
    expect(anotherJob).toBeCalledTimes(2);
    schedulerService.stop();
});

test('Can schedule multiple jobs at the different intervals', async () => {
    const { logger } = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = jest.fn();
    const anotherJob = jest.fn();

    schedulerService.schedule(job, 100, 'test-id-8');
    schedulerService.schedule(anotherJob, 200, 'test-id-9');
    await ms(250);

    expect(job).toBeCalledTimes(3);
    expect(anotherJob).toBeCalledTimes(2);
    schedulerService.stop();
});

test('Can handle crash of a async job', async () => {
    const { logger, getRecords } = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = async () => {
        await Promise.reject('async reason');
    };

    schedulerService.schedule(job, 50, 'test-id-10');
    await ms(75);

    schedulerService.stop();
    expect(getRecords()).toEqual([
        ['scheduled job failed | id: test-id-10 | async reason'],
        ['scheduled job failed | id: test-id-10 | async reason'],
    ]);
});

test('Can handle crash of a sync job', async () => {
    const { logger, getRecords } = getLogger();
    const schedulerService = new SchedulerService(logger);
    const job = () => {
        throw new Error('sync reason');
    };

    schedulerService.schedule(job, 50, 'test-id-11');
    await ms(75);

    schedulerService.stop();
    expect(getRecords()).toEqual([
        ['scheduled job failed | id: test-id-11 | Error: sync reason'],
        ['scheduled job failed | id: test-id-11 | Error: sync reason'],
    ]);
});
