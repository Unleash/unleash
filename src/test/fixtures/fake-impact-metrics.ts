export const fakeImpactMetricsResolver = () => ({
    counters: new Map<string, { value: number; help: string }>(),
    gauges: new Map<string, { value: number; help: string }>(),

    defineCounter(name: string, help: string) {
        this.counters.set(name, { value: 0, help });
    },

    defineGauge(name: string, help: string) {
        this.gauges.set(name, { value: 0, help });
    },

    incrementCounter(name: string, value: number = 1) {
        const counter = this.counters.get(name);

        if (!counter) {
            return;
        }

        counter.value += value;
        this.counters.set(name, counter);
    },

    updateGauge(name: string, value: number) {
        const gauge = this.gauges.get(name);

        if (!gauge) {
            return;
        }

        gauge.value = value;
        this.gauges.set(name, gauge);
    },
});
