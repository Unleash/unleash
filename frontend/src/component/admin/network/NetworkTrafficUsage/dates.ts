import { format, getDaysInMonth } from 'date-fns';

export const currentDate = new Date();

// making this a constant instead of a function. This avoids re-calculating and
// formatting every time it's called, but it does introduce some edge cases
// where it might stay the same across component renders.
export const currentMonth = format(currentDate, 'yyyy-MM');

export const daysInCurrentMonth = getDaysInMonth(currentDate);

export const formatMonth = (date: Date) => format(date, 'yyyy-MM');
export const formatDay = (date: Date) => format(date, 'yyyy-MM-dd');
