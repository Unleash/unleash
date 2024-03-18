import type { VFC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHM } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

interface IDateTimeCellProps {
    value?: Date | string | null;
    timeZone?: string;
}

export const DateTimeCell: VFC<IDateTimeCellProps> = ({ value, timeZone }) => {
    const { locationSettings } = useLocationSettings();

    const date = value
        ? value instanceof Date
            ? formatDateYMDHM(value, locationSettings.locale, timeZone)
            : formatDateYMDHM(
                  parseISO(value),
                  locationSettings.locale,
                  timeZone,
              )
        : undefined;

    return <TextCell lineClamp={1}>{date}</TextCell>;
};
