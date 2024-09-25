import type { Chart } from 'chart.js';

export const customHighlightPlugin = (width = 46, bottomOverflow = 34) => ({
    id: 'customLine',
    beforeDraw: (chart: Chart) => {
        if (chart.tooltip?.opacity && chart.tooltip.x) {
            const x = chart.tooltip.caretX;
            const yAxis = chart.scales.y;
            const ctx = chart.ctx;
            ctx.save();
            const gradient = ctx.createLinearGradient(
                x,
                yAxis.top,
                x,
                yAxis.bottom + 34,
            );
            gradient.addColorStop(0, 'rgba(129, 122, 254, 0)');
            gradient.addColorStop(1, 'rgba(129, 122, 254, 0.12)');
            ctx.fillStyle = gradient;
            ctx.roundRect(
                x - width / 2,
                yAxis.top,
                width,
                yAxis.bottom - yAxis.top + bottomOverflow,
                5,
            );
            ctx.fill();
            ctx.restore();
        }
    },
});
