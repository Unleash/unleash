import type { Chart } from 'chart.js';

export const legendOptions = {
    position: 'bottom',
    labels: {
        boxWidth: 12,
        padding: 30,
        generateLabels: (chart: Chart) => {
            const datasets = chart.data.datasets;
            const {
                labels: { usePointStyle, pointStyle, textAlign, color },
            } = chart?.legend?.options || {
                labels: {},
            };

            return (chart as any)._getSortedDatasetMetas().map((meta: any) => {
                const style = meta.controller.getStyle(
                    usePointStyle ? 0 : undefined,
                );
                return {
                    text: datasets[meta.index].label,
                    fillStyle: style.borderColor,
                    fontColor: color,
                    hidden: !meta.visible,
                    lineWidth: 0,
                    borderRadius: 6,
                    strokeStyle: style.borderColor,
                    pointStyle: pointStyle || style.pointStyle,
                    textAlign: textAlign || style.textAlign,
                    datasetIndex: meta.index,
                };
            });
        },
    },
} as const;
