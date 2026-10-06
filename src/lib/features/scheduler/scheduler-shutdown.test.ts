import EventEmitter from 'events';
import { afterEach, expect, test, vi } from 'vitest';
import type { LogProvider } from '../../logger.js';
import { SCHEDULER_JOB_TIME } from '../../metric-events.js';
import { SchedulerService } from './scheduler-service.js';

const createScheduler = () => {
    const error = vi.fn();
    const maintenanceStatus = {
        isMaintenanceMode: vi.fn(async () => false),
    };
    const eventBus = new EventEmitter();
    const scheduler = new SchedulerService(
        (() => ({ error })) as unknown as LogProvider,
        maintenanceStatus,
        eventBus,
    );
    return { scheduler, maintenanceStatus, eventBus, error };
};

afterEach(() => vi.useRealTimers());

test('stop drains a running job and prevents further executions', async () => {
    vi.useFakeTimers();
    const { scheduler } = createScheduler();
    const pending = Promise.withResolvers<void>();
    const job = vi.fn(() => pending.promise);
    const initialRun = scheduler.schedule(job, 10, 'job', 0);
    await vi.advanceTimersByTimeAsync(0);
    expect(job).toHaveBeenCalledTimes(1);

    const stopped = vi.fn();
    const shutdown = scheduler.stop().then(stopped);
    await vi.advanceTimersByTimeAsync(100);
    expect(stopped).not.toHaveBeenCalled();
    expect(job).toHaveBeenCalledTimes(1);

    pending.resolve();
    await Promise.all([initialRun, shutdown]);
    expect(stopped).toHaveBeenCalledTimes(1);
    await scheduler.schedule(job, 10, 'another-job', 0);
    await vi.advanceTimersByTimeAsync(100);
    expect(job).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
});

test('stop cancels the initial jitter timer and recurring timer', async () => {
    vi.useFakeTimers();
    const { scheduler } = createScheduler();
    const job = vi.fn(async () => {});
    await scheduler.schedule(job, 100, 'job', 50);
    await scheduler.stop();
    await vi.advanceTimersByTimeAsync(200);
    expect(job).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
});

test('stop waits for a pending maintenance check without starting its job', async () => {
    vi.useFakeTimers();
    const { scheduler, maintenanceStatus } = createScheduler();
    const pending = Promise.withResolvers<boolean>();
    maintenanceStatus.isMaintenanceMode.mockReturnValue(pending.promise);
    const job = vi.fn(async () => {});
    const initialRun = scheduler.schedule(job, 100, 'job', 0);
    const stopped = vi.fn();
    const shutdown = scheduler.stop().then(stopped);
    await vi.advanceTimersByTimeAsync(0);
    expect(stopped).not.toHaveBeenCalled();
    pending.resolve(false);
    await Promise.all([initialRun, shutdown]);
    expect(job).not.toHaveBeenCalled();
    expect(stopped).toHaveBeenCalledTimes(1);
});

test('jittered job failures are logged and timed, and shutdown still completes', async () => {
    vi.useFakeTimers();
    const { scheduler, eventBus, error } = createScheduler();
    const failure = new Error('job failed');
    const timing = vi.fn();
    eventBus.on(SCHEDULER_JOB_TIME, timing);
    await scheduler.schedule(
        async () => {
            throw failure;
        },
        100,
        'job',
        10,
    );
    await vi.advanceTimersByTimeAsync(10);
    await scheduler.stop();
    expect(error).toHaveBeenCalledWith(
        'Scheduled job failed | id: job',
        failure,
    );
    expect(timing).toHaveBeenCalledWith({
        jobId: 'job',
        time: expect.any(Number),
    });
});
