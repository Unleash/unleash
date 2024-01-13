export const daysOrHours = (hoursBack: number): string => {
    if (hoursBack > 48) {
        return `${Math.floor(hoursBack / 24)} days (UTC)`;
    }
    return `${hoursBack} hours (local time)`;
};
