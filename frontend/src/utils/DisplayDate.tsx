import { FC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import {
    formatDateHM,
    formatDateYMD,
    formatDateYMDHM,
    formatDateYMDHMS,
} from './formatDate';

type DateDisplayProps = {
    displayFormat: 'YMD' | 'HM' | 'YMDHMS' | 'YMDHM';
    date: Date | string;
};

// You are responsible for ensuring that the string / number you pass in is valid.
export const DisplayDate: FC<DateDisplayProps> = ({ displayFormat, date }) => {
    const { locationSettings } = useLocationSettings();
    const locale = locationSettings?.locale;

    const format = (() => {
        switch (displayFormat) {
            case 'HM':
                return formatDateHM;
            case 'YMD':
                return formatDateYMD;
            case 'YMDHM':
                return formatDateYMDHM;
            case 'YMDHMS':
                return formatDateYMDHMS;
        }
    })();

    const formattedDate = format(date, locale);

    return <time>{formattedDate}</time>;
};
