import { Tooltip, Typography } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import type { FC, ReactNode } from 'react';
import { formatDateYMD } from 'utils/formatDate';
import { TextCell } from '../TextCell/TextCell.tsx';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import type { ColumnInstance } from 'react-table';

export interface ITimeAgoCellProps {
    value?: string | number | Date | null;
    column?: ColumnInstance;
    live?: boolean;
    emptyText?: string;
    title?: (date?: string) => ReactNode;
    dateFormat?: (value: string | number | Date, locale: string) => string;
}

export const TimeAgoCell: FC<ITimeAgoCellProps> = ({
    value,
    column,
    live = false,
    emptyText = 'Never',
    title = (date) =>
        date ? (column ? `${column.Header}: ${date}` : date) : '',
    dateFormat = formatDateYMD,
}) => {
    const { locationSettings } = useLocationSettings();

    const tooltip = value
        ? title(dateFormat(value, locationSettings.locale))
        : title();

    return (
        <TextCell>
            <Tooltip title={tooltip} arrow>
                <Typography
                    noWrap
                    sx={{
                        display: 'inline-block',
                        maxWidth: '100%',
                    }}
                    component='span'
                    variant='body2'
                    data-loading
                >
                    {value ? (
                        <TimeAgo date={value} refresh={live} />
                    ) : (
                        emptyText
                    )}
                </Typography>
            </Tooltip>
        </TextCell>
    );
};
