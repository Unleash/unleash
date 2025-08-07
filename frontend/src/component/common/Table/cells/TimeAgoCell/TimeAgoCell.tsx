import { Tooltip, Typography } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import type { FC } from 'react';
import { formatDateYMD } from 'utils/formatDate';
import { TextCell } from '../TextCell/TextCell.tsx';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import type { ColumnInstance } from 'react-table';

interface ITimeAgoCellProps {
    value?: string | number | Date | null;
    column?: ColumnInstance;
    live?: boolean;
    emptyText?: string;
    title?: (date: string) => string;
    dateFormat?: (value: string | number | Date, locale: string) => string;
}

export const TimeAgoCell: FC<ITimeAgoCellProps> = ({
    value,
    column,
    live = false,
    emptyText = 'Never',
    title = (date) => (column ? `${column.Header}: ${date}` : date),
    dateFormat = formatDateYMD,
}) => {
    const { locationSettings } = useLocationSettings();

    if (!value) return <TextCell>{emptyText}</TextCell>;

    const date = dateFormat(value, locationSettings.locale);

    return (
        <TextCell>
            <Tooltip title={title(date)} arrow>
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
                    <TimeAgo date={value} refresh={live} />
                </Typography>
            </Tooltip>
        </TextCell>
    );
};
