export class Timer {
    private callback: () => void;

    private timer?: NodeJS.Timeout;

    private start?: number;

    private remaining: number;

    constructor(callback: () => void, delay = 0) {
        this.callback = callback;
        this.remaining = delay;
        this.resume();
    }

    public pause() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
            this.remaining -= Date.now() - this.start!;
        }
    }

    public resume() {
        if (!this.timer) {
            this.start = Date.now();
            this.timer = setTimeout(this.callback, this.remaining);
        }
    }
}
