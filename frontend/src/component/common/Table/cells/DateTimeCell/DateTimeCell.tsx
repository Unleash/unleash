import { VFC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHM } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

interface IDateTimeCellProps {
    value?: Date | string | null;
}

export const DateTimeCell: VFC<IDateTimeCellProps> = ({ value }) => {
    const { locationSettings } = useLocationSettings();

    const date = value
        ? value instanceof Date
            ? formatDateYMDHM(value, locationSettings.locale)
            : formatDateYMDHM(parseISO(value), locationSettings.locale)
        : undefined;

    return <TextCell lineClamp={1}>{date}</TextCell>;
};
