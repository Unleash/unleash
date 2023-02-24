import { Tooltip, Typography } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { VFC } from 'react';
import { formatDateYMD, formatDateYMDHMS } from 'utils/formatDate';
import { TextCell } from '../TextCell/TextCell';
import TimeAgo from 'react-timeago';

interface ITimeAgoCellProps {
    value?: string | number | Date;
    live?: boolean;
    emptyText?: string;
    title?: (date: string) => string;
    timestamp?: boolean;
}

export const TimeAgoCell: VFC<ITimeAgoCellProps> = ({
    value,
    live = false,
    emptyText,
    title,
    timestamp,
}) => {
    const { locationSettings } = useLocationSettings();

    if (!value) return <TextCell>{emptyText}</TextCell>;

    const date = timestamp
        ? formatDateYMDHMS(value, locationSettings.locale)
        : formatDateYMD(value, locationSettings.locale);

    return (
        <TextCell>
            <Tooltip title={title?.(date) ?? date} arrow>
                <Typography
                    noWrap
                    component="span"
                    variant="body2"
                    data-loading
                >
                    <TimeAgo date={new Date(value)} live={live} title={''} />
                </Typography>
            </Tooltip>
        </TextCell>
    );
};
