import type { Tick } from 'chart.js';

export const formatTickValue = (
    tickValue: string | number,
    _index: number,
    _ticks: Tick[],
) => {
    if (typeof tickValue === 'string') {
        return tickValue;
    }
    const value = Number.parseInt(tickValue.toString(), 10);
    if (value > 999999) {
        return `${value / 1000000}M`;
    }
    return value > 999 ? `${value / 1000}k` : value;
};
