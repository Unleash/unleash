export default class SchedulerService {
    private intervalIds: NodeJS.Timer[] = [];

    schedule(scheduledFunction: () => void, timeMs: number): void {
        this.intervalIds.push(setInterval(scheduledFunction, timeMs).unref());
    }

    stop(): void {
        this.intervalIds.forEach(clearInterval);
    }
}
