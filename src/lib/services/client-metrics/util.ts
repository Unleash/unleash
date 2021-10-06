import { GroupedClientMetrics } from '../../types/models/metrics';
import { IClientMetricsEnv } from '../../types/stores/client-metrics-store-v2';

//duplicate from client-metrics-store-v2.ts
export function roundDownToHour(date: Date): Date {
    let p = 60 * 60 * 1000; // milliseconds in an hour
    return new Date(Math.floor(date.getTime() / p) * p);
}

export function generateLastNHours(n: number, start: Date): Date[] {
    const nHours: Date[] = [];
    nHours.push(roundDownToHour(start));
    for (let i = 1; i < n; i++) {
        const prev = nHours[i - 1];
        const next = new Date(prev);
        next.setHours(prev.getHours() - 1);
        nHours.push(next);
    }

    return nHours;
}

export function groupMetricsOnEnv(
    metrics: IClientMetricsEnv[],
): GroupedClientMetrics[] {
    const hours = generateLastNHours(24, new Date());
    const environments = metrics.map((m) => m.environment);

    const grouped = {};

    hours.forEach((time) => {
        environments.forEach((environment) => {
            grouped[`${time}:${environment}`] = {
                timestamp: time,
                environment,
                yes_count: 0,
                no_count: 0,
            };
        });
    });

    metrics.forEach((m) => {
        grouped[`${m.timestamp}:${m.environment}`].yes_count += m.yes;
        grouped[`${m.timestamp}:${m.environment}`].no_count += m.no;
    });

    return Object.values(grouped);
}
