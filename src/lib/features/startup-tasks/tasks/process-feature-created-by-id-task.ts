import { IUnleashServices } from '../../../server-impl';
import { IStartupTask } from '../startup-task-service';

export class ProcessFeatureCreatedByIdTask implements IStartupTask {
    constructor(services: IUnleashServices) {}

    shouldRun(): Promise<boolean> {
        return Promise.resolve(false);
    }
    run(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    stop(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
