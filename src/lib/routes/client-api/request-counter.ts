datefns;

export default class RequestCounter {
    private requestCache: Object;
    private longTermCache: Object;
    private interval: number;

    constructor() {
        this.requestCache = {};
        this.longTermCache = [];

        this.interval = setInterval(() => {
            this.requestCache.endTime = new Date();

            const longTermCacheObject = {
                ...this.requestCache,
                rps: this.calculateRPS(),
            };

            this.longTermCache.push(longTermCacheObject);

            this.requestCache = this.createBucket();
        }, 300000).unref();
    }

    createBucket = () => {
        const bucket = {
            count: 0,
            startTime: new Date(),
            endTime: null,
        };
        return bucket;
    };

    recordRequest = (appName: string): Promise<void> => {
        if (this.requestCache[appName]) {
            this.requestCache[count] += 1;
        } else {
            this.requestCache[appName] = { count: 1 };
        }
    };

    calculateRPS = () => {
        const { count } = this.requestCache;
        return count / 300;
    };
}
