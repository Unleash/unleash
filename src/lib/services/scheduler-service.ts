import { Logger, LogProvider } from '../logger';

export class SchedulerService {
    private intervalIds: NodeJS.Timer[] = [];

    private logger: Logger;

    constructor(getLogger: LogProvider) {
        this.logger = getLogger('/services/scheduler-service.ts');
    }

    async schedule(
        scheduledFunction: () => void,
        timeMs: number,
    ): Promise<void> {
        this.intervalIds.push(
            setInterval(async () => {
                try {
                    await scheduledFunction();
                } catch (e) {
                    this.logger.error('scheduled job failed', e);
                }
            }, timeMs).unref(),
        );
        try {
            await scheduledFunction();
        } catch (e) {
            this.logger.error('scheduled job failed', e);
        }
    }

    stop(): void {
        this.intervalIds.forEach(clearInterval);
    }
}
