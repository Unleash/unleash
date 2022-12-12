import {
    InstanceMetrics,
    useInstanceMetrics
} from "../../../../hooks/api/getters/useInstanceMetrics/useInstanceMetrics";
import { useMemo, VFC } from "react";
import { Line } from "react-chartjs-2";
import {
    CategoryScale,
    Chart as ChartJS, ChartData, ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip
} from "chart.js";
import { ILocationSettings, useLocationSettings } from "../../../../hooks/useLocationSettings";
import theme from "../../../../themes/theme";
import { formatDateHM } from "../../../../utils/formatDate";
import { RequestsPerSecondSchema } from "@server/openapi";
import 'chartjs-adapter-date-fns';


interface IPoint {
    x: string;
    y: number;
}

const createChartPoints = (metrics: RequestsPerSecondSchema, y: (m: string) => number): IPoint[] => {
    // @ts-expect-error
    return metrics.data.result[0]?.values.map(row =>
        // @ts-expect-error
        ({ x: row[0], y: y(row[1]) })
    );
};
const createInstanceChartOptions = (metrics: InstanceMetrics, locationSettings: ILocationSettings): ChartOptions<"line"> => {
    return {
        locale: locationSettings.locale,
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index",
            intersect: false
        },
        plugins: {
            tooltip: {
                backgroundColor: "white",
                bodyColor: theme.palette.text.primary,
                titleColor: theme.palette.grey[700],
                borderColor: theme.palette.primary.main,
                borderWidth: 1,
                padding: 10,
                boxPadding: 5,
                usePointStyle: true,
                callbacks: {
                    title: items =>
                        formatDateHM(
                            items[0].parsed.x,
                            locationSettings.locale
                        )
                },
                itemSort: (a, b) => b.parsed.y - a.parsed.y
            },
            legend: {
                position: "top",
                align: "end",
                labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    usePointStyle: true
                }
            },
            title: {
                text: "Requests per second in the last 6 hours",
                position: "top",
                align: "start",
                display: true,
                font: {
                    size: 16,
                    weight: "400"
                }
            }
        },
        scales: {
            y: {
                type: "linear",
                title: {
                    display: true,
                    text: "Requests per second"
                },
                // min: 0,
                suggestedMin: 0,
                ticks: { precision: 0 }
            },
            x: {
                type: "time",
                time: { unit: "minute" },
                grid: { display: false },
                ticks: {
                    callback: (_, i, data) =>
                        formatDateHM(data[i].value, locationSettings.locale)
                }
            }
        }
    };
};

const createInstanceChartData = (metrics?: InstanceMetrics): ChartData<"line", IPoint[], string> => {
    if (metrics) {
        const adminSeries = {
            label: "/api/admin/*",
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main,
            data: createChartPoints(metrics?.adminMetrics, (y) => parseFloat(y)),
            elements: {
                point: {
                    radius: 4,
                    pointStyle: "circle"
                },
                line: {
                    borderDash: [8, 4]
                }
            }
        };

        const clientSeries = {
            label: "/api/client/*",
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main,
            data: createChartPoints(metrics?.clientMetrics, (y) => parseFloat(y)),
            elements: {
                point: {
                    radius: 4,
                    pointStyle: "circle"
                },
                line: {
                    borderDash: [8, 4]
                }
            }

        };
        return { datasets: [adminSeries, clientSeries] };
    }
    return { datasets: [] };
};
export const InstanceMetricsChart: VFC = () => {
    const { locationSettings } = useLocationSettings();
    const { metrics } = useInstanceMetrics();
    const options = useMemo(() => {
        return createInstanceChartOptions(metrics, locationSettings);
    }, [metrics, locationSettings]);

    const data = useMemo(() => {
        return createInstanceChartData(metrics);
    }, [metrics, locationSettings]);

    return (
        <div style={{ height: 400 }}>
            <Line data={data} options={options}
                  aria-label="An instance metrics line chart with two lines: requests per second for admin API and requests per second for client API" />
        </div>
    );
};
// Register dependencies that we need to draw the chart.
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Legend,
    Tooltip,
    Title
);

// Use a default export to lazy-load the charting library.
export default InstanceMetricsChart;
