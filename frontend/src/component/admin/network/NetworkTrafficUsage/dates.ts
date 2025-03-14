import { format, getDaysInMonth, parse } from 'date-fns';

export const currentDate = new Date();

// making this a constant instead of a function. This avoids re-calculating and
// formatting every time it's called, but it does introduce some edge cases
// where it might stay the same across component renders.
export const currentMonth = format(currentDate, 'yyyy-MM');

export const daysInCurrentMonth = getDaysInMonth(currentDate);

export const formatMonth = (date: Date) => format(date, 'yyyy-MM');
export const formatDay = (date: Date) => format(date, 'yyyy-MM-dd');

export const parseMonthString = (month: string): Date => {
    // parses a month into a Date starting on the first day of the month, regardless of the current time zone (e.g. works in Norway and Brazil)
    return parse(month, 'yyyy-MM', new Date());
};

export const parseDateString = (month: string): Date => {
    // parses a date string into a Date, regardless of the current time zone (e.g. works in Norway and Brazil)
    return parse(month, 'yyyy-MM-dd', new Date());
};
