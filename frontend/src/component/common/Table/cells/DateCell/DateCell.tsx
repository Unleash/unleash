import { VFC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { getLocalizedDateString } from '../../../util';

interface IDateCellProps {
    value?: Date | string | null;
    getValue?: () => Date | string | null | undefined;
}

export const DateCell: VFC<IDateCellProps> = ({ value, getValue }) => {
    const input = value || getValue?.() || null;
    const { locationSettings } = useLocationSettings();
    const date = getLocalizedDateString(input, locationSettings.locale);

    return <TextCell lineClamp={1}>{date}</TextCell>;
};
