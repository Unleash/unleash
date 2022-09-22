interface IRequestBucket {
    apps: IRequestBucketApps;
    startTime: Date;
    endTime?: Date;
}

interface IRequestBucketApps {
    [appName: string]: {
        count: number;
        rps?: number;
    };
}

export default class RequestCounter {
    private requestCache: IRequestBucket;

    private longTermCache: IRequestBucket[];

    constructor() {
        this.requestCache = this.createBucket();
        this.longTermCache = [];

        setInterval(() => {
            this.requestCache.endTime = new Date();

            const longTermCacheObject = this.calculateRPS(this.requestCache);

            this.longTermCache.push(longTermCacheObject);

            this.requestCache = this.createBucket();
        }, 300000).unref();
    }

    createBucket = (): IRequestBucket => {
        const bucket = {
            apps: {},
            startTime: new Date(),
            endTime: null,
        };
        return bucket;
    };

    recordRequest = (appName: string): void => {
        if (this.requestCache.apps[appName]) {
            this.requestCache.apps[appName].count += 1;
        } else {
            this.requestCache.apps[appName] = { count: 1 };
        }
    };

    getBuckets = (): Object => {
        return this.longTermCache;
    };

    calculateRPS = (requestCache: IRequestBucket): IRequestBucket => {
        Object.keys(requestCache.apps).forEach((appName) => {
            const app = requestCache.apps[appName];
            const rps = app.count / 300;
            app.rps = rps;
        });

        return requestCache;
    };

    // @ts-ignore
    isRPSOverTresholdForApp = (appName: string): Boolean => {
        return true;
    };
}
