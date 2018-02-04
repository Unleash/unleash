import { fetchFeatureMetrics } from './store/feature-metrics-actions';

class MetricsPoller {
    constructor(store) {
        this.store = store;
        this.timer = undefined;
    }

    start() {
        this.store.subscribe(() => {
            const features = this.store.getState().features;
            if (!this.timer && features.size > 0) {
                this.timer = setInterval(this.fetchMetrics.bind(this), 5000);
                this.fetchMetrics();
            }
        });
    }

    fetchMetrics() {
        this.store.dispatch(fetchFeatureMetrics());
    }

    destroy() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }
}

export default MetricsPoller;
