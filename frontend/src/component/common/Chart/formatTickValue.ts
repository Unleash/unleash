import type { Tick } from 'chart.js';

export const formatTickValue = (
    tickValue: string | number,
    index: number,
    ticks: Tick[],
) => {
    if (typeof tickValue === 'string') {
        return tickValue;
    }
    const value = Number.parseInt(tickValue.toString());
    if (value > 999999) {
        return `${value / 1000000}M`;
    }
    return value > 999 ? `${value / 1000}k` : value;
};
