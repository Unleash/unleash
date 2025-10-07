import type { Chart } from 'chart.js';

type CustomHighlightPluginOptions = {
    width?: number | ((chart: Chart) => number);
    maxHighlightOpacity?: number;
    bottomOverflow?: number;
};

const defaultCategoryPercentage = 0.8;
export const smartWidth = (chart: Chart) => {
    const xAxisEntries = chart.data.datasets[0]?.data ?? chart.scales.x.ticks;
    return (
        (chart.width / xAxisEntries.length) *
        (chart.options.datasets?.bar?.categoryPercentage ??
            defaultCategoryPercentage)
    );
};

// Vertical line on the hovered chart, filled with gradient. Highlights a section of a chart when you hover over datapoints
export const customHighlightPlugin = (
    options?: CustomHighlightPluginOptions,
) => ({
    id: 'customLine',
    beforeDraw: (chart: Chart) => {
        const {
            width = smartWidth,
            maxHighlightOpacity = 0.12,
            bottomOverflow = 0,
        } = options ?? {};

        const highlightWidth =
            typeof width === 'function' ? width(chart) : width;
        if (chart.tooltip?.opacity && chart.tooltip.x) {
            const x = chart.tooltip.caretX;
            const yAxis = chart.scales.y;
            const ctx = chart.ctx;
            ctx.save();
            const gradient = ctx.createLinearGradient(
                x,
                yAxis.top,
                x,
                yAxis.bottom + bottomOverflow,
            );
            gradient.addColorStop(0, 'rgba(129, 122, 254, 0)');
            gradient.addColorStop(
                1,
                `rgba(129, 122, 254, ${maxHighlightOpacity})`,
            );
            ctx.fillStyle = gradient;

            const args: [number, number, number, number] = [
                x - highlightWidth / 2,
                yAxis.top,
                highlightWidth,
                yAxis.bottom - yAxis.top + bottomOverflow,
            ];
            if (bottomOverflow) {
                ctx.roundRect(...args, 5);
                ctx.fill();
            } else {
                ctx.fillRect(...args);
            }
            ctx.restore();
        }
    },
});
