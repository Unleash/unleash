import {
    useCallback,
    useEffect,
    useState,
    type MutableRefObject,
    type RefObject,
} from 'react';
import type { Chart as ChartInstance } from 'chart.js';

export type PlotArea = { leftPx: number; widthPx: number };

// Measures the Chart.js plot area (the rectangle between the axes) in pixels
// relative to the wrapping element. Overlays positioned with the returned
// values line up exactly with the drawn axes.
//
// Re-runs on container resize and whenever any value in `invalidateKeys`
// changes — typically the dataset and any state that affects layout.
export const useChartPlotArea = (
    wrapperRef: RefObject<HTMLElement>,
    chartRef: MutableRefObject<ChartInstance<'line'> | null>,
    invalidateKeys: unknown[],
): PlotArea | null => {
    const [plotArea, setPlotArea] = useState<PlotArea | null>(null);

    const measure = useCallback(() => {
        const wrapper = wrapperRef.current;
        const chart = chartRef.current;
        if (!wrapper || !chart) return;
        const canvasRect = chart.canvas.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const leftPx =
            canvasRect.left - wrapperRect.left + chart.chartArea.left;
        const widthPx = chart.chartArea.right - chart.chartArea.left;
        setPlotArea((prev) => {
            if (
                prev &&
                Math.abs(prev.leftPx - leftPx) < 0.5 &&
                Math.abs(prev.widthPx - widthPx) < 0.5
            ) {
                return prev;
            }
            return { leftPx, widthPx };
        });
    }, [wrapperRef, chartRef]);

    // Chart.js's chartArea is only populated after layout runs, so we defer
    // measurement one frame.
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        let frame = 0;
        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };

        const observer = new ResizeObserver(schedule);
        observer.observe(wrapper);
        schedule();

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [measure, ...invalidateKeys]);

    return plotArea;
};
