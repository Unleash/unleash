import type { FC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { getLocalizedDateString } from '../../../util.ts';

interface IDateCellProps {
    value?: Date | string | null;
    getValue?: () => unknown;
}

// `getValue is for new @tanstack/react-table (v8), `value` is for legacy react-table (v7)
export const DateCell: FC<IDateCellProps> = ({ value, getValue }) => {
    const raw = value ?? getValue?.();
    const input =
        raw == null
            ? null
            : raw instanceof Date || typeof raw === 'string'
              ? raw
              : null;
    const { locationSettings } = useLocationSettings();
    const date = getLocalizedDateString(input, locationSettings.locale);

    return <TextCell lineClamp={1}>{date}</TextCell>;
};
