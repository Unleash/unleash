const dateTimeOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
};
// todo for a more comprehensive list use of moment.tz from https://github.com/moment/moment-timezone
const predefinedLocale = [
    {
        locale: 'nb-NO',
        timezone: 'UTC',
    },
    {
        locale: 'us-US',
        timezone: 'America/New_York',
    },
    {
        locale: 'en-GB',
        timezone: 'Europe/London',
    },
];
export const formatFullDateTimeWithLocale = (v, locale) => {
    let found = predefinedLocale.find(v => v.locale === locale);
    dateTimeOptions.timeZone = found ? found.timezone : 'UTC';
    return new Date(v).toLocaleString(locale, dateTimeOptions);
};
