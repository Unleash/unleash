import { useEffect, useState, type FC } from 'react';
import { formatDistanceToNow, secondsToMilliseconds } from 'date-fns';

type TimeAgoProps = {
    date: Date | number | string | null | undefined;
    fallback?: string;
    live?: boolean | number;
};

const getRefreshInterval = (input?: boolean | number) => {
    if (input === undefined) return secondsToMilliseconds(12);
    if (input === false) return false;
    if (input === true) return secondsToMilliseconds(12);
    return secondsToMilliseconds(input);
};

const TimeAgo: FC<TimeAgoProps> = ({ date, fallback = '', live }) => {
    const getValue = () => {
        if (!date) return fallback;
        try {
            return formatDistanceToNow(new Date(date), {
                addSuffix: true,
            }).replace('about ', '');
        } catch {
            return fallback;
        }
    };
    const [value, setValue] = useState<string>(getValue);

    useEffect(() => {
        setValue(getValue);
    }, [date, fallback]);

    useEffect(() => {
        const refreshInterval = getRefreshInterval(live);
        if (!date || !refreshInterval) return;

        const intervalId = setInterval(() => {
            setValue(getValue);
        }, refreshInterval);

        return () => clearInterval(intervalId);
    }, [live]);

    return value;
};

export default TimeAgo;
