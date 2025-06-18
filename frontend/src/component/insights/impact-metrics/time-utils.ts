export const getTimeUnit = (selectedRange: string) => {
    switch (selectedRange) {
        case 'hour':
            return 'minute';
        case 'day':
            return 'hour';
        case 'week':
            return 'day';
        case 'month':
            return 'day';
        default:
            return 'hour';
    }
};

export const getDisplayFormat = (selectedRange: string) => {
    // TODO: localized format
    switch (selectedRange) {
        case 'hour':
            return 'HH:mm:ss';
        case 'day':
            return 'HH:mm';
        case 'week':
            return 'MMM dd';
        case 'month':
            return 'MMM dd';
        default:
            return 'MMM dd HH:mm';
    }
};

export const getDateRange = (
    selectedRange: 'hour' | 'day' | 'week' | 'month',
) => {
    const now = new Date();
    const endTime = now;

    switch (selectedRange) {
        case 'hour': {
            const startTime = new Date(now);
            startTime.setMinutes(now.getMinutes() - 60, 0, 0);
            return { min: startTime, max: endTime };
        }
        case 'day': {
            const startTime = new Date(now);
            startTime.setHours(now.getHours() - 24, 0, 0, 0);
            return { min: startTime, max: endTime };
        }
        case 'week': {
            const startTime = new Date(now);
            startTime.setDate(now.getDate() - 7);
            startTime.setHours(0, 0, 0, 0);
            const endTimeWeek = new Date(now);
            endTimeWeek.setHours(23, 59, 59, 999);
            return { min: startTime, max: endTimeWeek };
        }
        case 'month': {
            const startTime = new Date(now);
            startTime.setDate(now.getDate() - 30);
            startTime.setHours(0, 0, 0, 0);
            const endTimeMonth = new Date(now);
            endTimeMonth.setHours(23, 59, 59, 999);
            return { min: startTime, max: endTimeMonth };
        }
        default:
            return { min: undefined, max: undefined };
    }
};
