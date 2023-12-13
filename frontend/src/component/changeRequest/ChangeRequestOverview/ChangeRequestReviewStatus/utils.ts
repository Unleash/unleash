export const getBrowserTimezoneInHumanReadableUTCOffset = (
    date = new Date(),
): string => {
    const offset = -date.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    let sign = '+';
    if (offset < 0) {
        sign = '-';
    }

    // Ensure that hours and minutes are two digits
    const zeroPaddedHours = hours.toString().padStart(2, '0');
    const zeroPaddedMinutes = minutes.toString().padStart(2, '0');

    return `UTC${sign}${zeroPaddedHours}:${zeroPaddedMinutes}`;
};

export const getBrowserTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
