export default class RequestCounter {
    private requestCache: Object;
    private longTermCache: Object;
    private interval: number;

    constructor() {
        this.requestCache = this.createBucket();
        this.longTermCache = [];

        this.interval = setInterval(() => {
            this.requestCache.endTime = new Date();

            const longTermCacheObject = this.calculateRPS(this.requestCache);

            this.longTermCache.push(longTermCacheObject);

            this.requestCache = this.createBucket();
        }, 300000).unref();
    }

    createBucket = () => {
        const bucket = {
            apps: {},
            startTime: new Date(),
            endTime: null,
        };
        return bucket;
    };

    recordRequest = (appName: string): void => {
        if (this.requestCache['apps'][appName]) {
            this.requestCache['apps'][appName].count += 1;
        } else {
            this.requestCache['apps'][appName] = { count: 1 };
        }
    };

    getBuckets = (): Object => {
        return this.longTermCache;
    };

    calculateRPS = (requestCache: Object) => {
        Object.keys(requestCache.apps).forEach((appName) => {
            const app = requestCache.apps[appName];
            const rps = app.count / 300;
            app.rps = rps;
        });

        return requestCache;
    };

    isRPSOverTresholdForApp = (appName: string) => {
        return true;
    };
}
