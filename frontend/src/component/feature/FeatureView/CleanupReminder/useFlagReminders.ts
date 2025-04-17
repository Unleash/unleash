import { isAfter, addDays } from 'date-fns';
import { useLocalStorageState } from 'hooks/useLocalStorageState';

type FlagReminderMap = Record<string, number>; // timestamp in ms

const REMINDER_KEY = 'flag-reminders:v1';
const MAX_REMINDERS = 50;
const DAYS = 7;

export const useFlagReminders = () => {
    const [reminders, setReminders] = useLocalStorageState<FlagReminderMap>(
        REMINDER_KEY,
        {},
    );

    const shouldShowReminder = (flagName: string): boolean => {
        const snoozedUntil = reminders[flagName];
        return !snoozedUntil || isAfter(new Date(), new Date(snoozedUntil));
    };

    const snoozeReminder = (flagName: string, days: number = DAYS) => {
        const snoozedUntil = addDays(new Date(), days).getTime();

        setReminders((prev) => {
            const updated = { ...prev, [flagName]: snoozedUntil };

            const entries = Object.entries(updated);

            if (entries.length > MAX_REMINDERS) {
                // Sort by timestamp (oldest first)
                entries.sort((a, b) => a[1] - b[1]);

                // Keep only the newest MAX_REMINDERS
                const trimmed = entries.slice(entries.length - MAX_REMINDERS);

                return Object.fromEntries(trimmed);
            }

            return updated;
        });
    };

    return {
        shouldShowReminder,
        snoozeReminder,
    };
};
