import { Tooltip, Typography } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import type { FC } from 'react';
import { formatDateYMD } from 'utils/formatDate';
import { TextCell } from '../TextCell/TextCell';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';

interface ITimeAgoCellProps {
    value?: string | number | Date;
    live?: boolean;
    emptyText?: string;
    title?: (date: string) => string;
    dateFormat?: (value: string | number | Date, locale: string) => string;
}

export const TimeAgoCell: FC<ITimeAgoCellProps> = ({
    value,
    live = false,
    emptyText,
    title,
    dateFormat = formatDateYMD,
}) => {
    const { locationSettings } = useLocationSettings();

    if (!value) return <TextCell>{emptyText}</TextCell>;

    const date = dateFormat(value, locationSettings.locale);

    return (
        <TextCell>
            <Tooltip title={title?.(date) ?? date} arrow>
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
