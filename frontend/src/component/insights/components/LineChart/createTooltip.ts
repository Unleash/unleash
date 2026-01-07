import type { Chart, TooltipModel } from 'chart.js';
import type { TooltipState } from './ChartTooltip/ChartTooltip.jsx';

export const createTooltip =
    (setTooltip: React.Dispatch<React.SetStateAction<TooltipState | null>>) =>
    (context: { chart: Chart; tooltip: TooltipModel<any> }) => {
        const tooltip = context.tooltip;
        if (tooltip.opacity === 0) {
            setTooltip(null);
            return;
        }

        setTooltip({
            caretX: tooltip?.caretX,
            caretY: tooltip?.caretY,
            title: tooltip?.title?.join(' ') || '',
            align: tooltip?.xAlign,
            body:
                tooltip?.body?.map((item: any, index: number) => ({
                    title: item?.lines?.join(' '),
                    color: tooltip?.labelColors?.[index]?.borderColor as string,
                    value: '',
                })) || [],
            dataPoints: tooltip?.dataPoints || [],
        });
    };
