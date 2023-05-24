import { Logger, LogProvider } from '../logger';

export type SchedulerMode = 'active' | 'paused';

export class SchedulerService {
    private intervalIds: NodeJS.Timer[] = [];

    private mode: SchedulerMode;

    private logger: Logger;

    constructor(getLogger: LogProvider) {
        this.logger = getLogger('/services/scheduler-service.ts');
        this.mode = 'active';
    }

    async schedule(
        scheduledFunction: () => void,
        timeMs: number,
    ): Promise<void> {
        this.intervalIds.push(
            setInterval(async () => {
                try {
                    if (this.mode === 'active') {
                        await scheduledFunction();
                    }
                } catch (e) {
                    this.logger.error('scheduled job failed', e);
                }
            }, timeMs).unref(),
        );
        try {
            if (this.mode === 'active') {
                await scheduledFunction();
            }
        } catch (e) {
            this.logger.error('scheduled job failed', e);
        }
    }

    stop(): void {
        this.intervalIds.forEach(clearInterval);
    }

    pause(): void {
        this.mode = 'paused';
    }

    resume(): void {
        this.mode = 'active';
    }

    getMode(): SchedulerMode {
        return this.mode;
    }
}
