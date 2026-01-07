import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { parseMonthString } from './dates.js';

export type ChartDataSelection =
    | {
          grouping: 'daily';
          month: string;
      }
    | {
          grouping: 'monthly';
          monthsBack: number;
      };

export const toDateRange = (
    selection: ChartDataSelection,
    now = new Date(),
): { from: string; to: string } => {
    const fmt = (date: Date) => format(date, 'yyyy-MM-dd');
    if (selection.grouping === 'daily') {
        const month = parseMonthString(selection.month);
        const from = fmt(month);
        const to = fmt(endOfMonth(month));
        return { from, to };
    } else {
        const from = fmt(startOfMonth(subMonths(now, selection.monthsBack)));
        const to = fmt(endOfMonth(now));
        return { from, to };
    }
};
