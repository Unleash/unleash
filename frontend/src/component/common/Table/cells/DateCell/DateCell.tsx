import { VFC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { getLocalizedDateString } from '../../../util';

interface IDateCellProps {
    value?: Date | string | null;
}

export const DateCell: VFC<IDateCellProps> = ({ value }) => {
    const { locationSettings } = useLocationSettings();
    const date = getLocalizedDateString(value, locationSettings.locale);

    return <TextCell lineClamp={1}>{date}</TextCell>;
};
