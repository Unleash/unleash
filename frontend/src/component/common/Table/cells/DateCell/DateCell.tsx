import { VFC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

interface IDateCellProps {
    value?: Date | string | null;
    getValue?: () => Date | string | null | undefined;
}

export const DateCell: VFC<IDateCellProps> = ({ value, getValue }) => {
    const { locationSettings } = useLocationSettings();
    const input = value || getValue?.();

    const date = input
        ? input instanceof Date
            ? formatDateYMD(input, locationSettings.locale)
            : formatDateYMD(parseISO(input), locationSettings.locale)
        : undefined;

    return <TextCell lineClamp={1}>{date}</TextCell>;
};
