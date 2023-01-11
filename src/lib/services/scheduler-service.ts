import { Logger, LogProvider } from '../logger';

export default class SchedulerService {
    private intervalIds: NodeJS.Timer[] = [];

    private logger: Logger;

    constructor(getLogger: LogProvider) {
        this.logger = getLogger('/services/scheduler-service.ts');
    }

    schedule(scheduledFunction: () => void, timeMs: number): void {
        this.intervalIds.push(
            setInterval(async () => {
                try {
                    await scheduledFunction();
                } catch (e) {
                    this.logger.error('scheduled job failed', e);
                }
            }, timeMs).unref(),
        );
    }

    stop(): void {
        this.intervalIds.forEach(clearInterval);
    }
}
