import { useCallback, useEffect, useState, type FC } from 'react';
import { formatDistanceToNow, secondsToMilliseconds } from 'date-fns';

type TimeAgoProps = {
    date: Date | number | string | null | undefined;
    fallback?: string;
    refresh?: boolean;
    timeElement?: boolean;
};

const formatTimeAgo = (date: string | number | Date) =>
    formatDistanceToNow(new Date(date), {
        addSuffix: true,
    })
        .replace('about ', '')
        .replace('less than a minute ago', '< 1 minute ago');

export const TimeAgo: FC<TimeAgoProps> = ({
    date,
    fallback = '',
    refresh = true,
    timeElement = true,
}) => {
    const getValue = useCallback((): {
        description: string;
        dateTime?: Date;
    } => {
        try {
            if (!date) return { description: fallback };
            return {
                description: formatTimeAgo(date),
                dateTime: timeElement ? new Date(date) : undefined,
            };
        } catch {
            return { description: fallback };
        }
    }, [date, fallback, timeElement]);
    const [state, setState] = useState(getValue);

    useEffect(() => {
        setState(getValue);
    }, [getValue]);

    useEffect(() => {
        if (!date || !refresh) return;

        const intervalId = setInterval(() => {
            setState(getValue);
        }, secondsToMilliseconds(12));

        return () => clearInterval(intervalId);
    }, [date, refresh, getValue]);

    if (!state.dateTime) {
        return state.description;
    }

    return (
        <time dateTime={state.dateTime.toISOString()}>{state.description}</time>
    );
};
